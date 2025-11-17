from flask import Blueprint, request, jsonify, current_app

from ..exceptions.custom_exceptions import ValidationCustomError, StripeCustomError
from ..models.order_model import OrderModel
from ..services.db_service import db
from ..services.stripe_service import create_payment_intent, confirm_payment_intent, get_payment_intent, \
	create_webhook_event

payments = Blueprint("payments", __name__, url_prefix="/payments")


@payments.route("/", methods=["POST"])
def add_payment():
	data = request.get_json()
	order_id = data.get("order_id")
	payment_method = data.get("payment_method_id")
	
	payment = None
	order = None
	try:
		order = OrderModel.query.get(order_id)
		if not order:
			raise ValidationCustomError("not_found", "pedido")
		
		if not order.payment_id and order.error != "paid":
			payment = create_payment_intent(order)
			order.payment_id = payment.id
			db.session.commit()
		
		payment = confirm_payment_intent(order.payment_id, payment_method)
		
		payment_data = {
			"payment_id": payment.id,
			"client_secret": payment.client_secret,
		}
		
		if payment.status not in ["succeeded", "requires_action", "processing"]:
			raise StripeCustomError(payment.status)
		return jsonify(**payment_data, status=payment.status), 200
	except Exception as e:
		if order:
			order.status = "failed"
			db.session.commit()
		raise e


@payments.route("/<payment_id>", methods=["GET"])
def get_payment(payment_id):
	payment = get_payment_intent(payment_id)
	response = {
		"payment_id": payment.id,
		"client_secret": payment.client_secret,
		"status": payment.status
	}
	return jsonify(**response), 200


@payments.route("/webhook", methods=["POST"])
def stripe_webhook_handler():
	payload = request.data
	sig_header = request.headers.get("Stripe-Signature")
	# TODO: Asignar variable de entorno en producción
	endpoint_secret = current_app.config["STRIPE_WEBHOOK_SECRET"]
	
	order = None
	payment = None
	try:
		event = create_webhook_event(payload, sig_header, endpoint_secret)
		
		payment = event.data.object
		order = OrderModel.query.filter_by(payment_id=payment.get("id")).first()
		if not order:
			raise ValidationCustomError("not_found", "pedido")
		
		if event.type == "payment_intent.succeeded":
			order.error = "paid"
			order.expires_at = None
		elif event.type in ["payment_intent.requires_action", "payment_intent.processing"]:
			order.error = "pending"
		else:
			order.error = "failed"
		
		db.session.commit()
		
		return jsonify(msg=f"Pago {payment.get("id")} procesado"), 200
	except ValueError:
		raise ValidationCustomError("invalid_data", "payload")
	except Exception as e:
		raise e
