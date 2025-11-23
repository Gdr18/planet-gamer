from flask import Blueprint, request, current_app

from src.core.exceptions.custom_exceptions import ResourceCustomError, StripeCustomError
from src.core.responses.api_responses import response_success, payment_response_success
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
			raise ResourceCustomError("not_found", "pedido")
		
		if not order.payment_id and order.error != "paid":
			payment = create_payment_intent(order)
			order.payment_id = payment.id
			db.session.commit()
		
		payment = confirm_payment_intent(order.payment_id, payment_method)
		
		if payment.status not in ["succeeded", "requires_action", "processing"]:
			raise StripeCustomError(payment.status)
		return payment_response_success(payment.id, payment.client_secret, payment.status)
	except Exception as e:
		if order:
			order.status = "failed"
			db.session.commit()
		raise e


@payments.route("/<payment_id>", methods=["GET"])
def get_payment(payment_id):
	payment = get_payment_intent(payment_id)
	return payment_response_success(payment.id, payment.client_secret, payment.status)


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
			raise ResourceCustomError("not_found", "pedido")
		
		if event.type == "payment_intent.succeeded":
			order.error = "paid"
			order.expires_at = None
		elif event.type in ["payment_intent.requires_action", "payment_intent.processing"]:
			order.error = "pending"
		else:
			order.error = "failed"
		
		db.session.commit()
		
		return response_success(f"el pago {payment.get("id")}", "procesado")
	except ValueError:
		raise ResourceCustomError("invalid_data", "payload")
	except Exception as e:
		raise e
