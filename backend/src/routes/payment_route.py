from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from config import WEBHOOK_SECRET_STRIPE
from ..core.api_responses import payment_response_success
from ..core.exceptions.custom_exceptions import ResourceCustomError, StripeCustomError, AuthCustomError
from ..core.extensions import db
from ..models.order_model import OrderModel
from ..services.stripe_service import create_payment_intent, confirm_payment_intent, get_payment_intent, \
	create_webhook_event

payments = Blueprint("payments", __name__, url_prefix="/payments")


@payments.route("/", methods=["POST"])
@jwt_required()
def create_and_confirm_payment():
	data = request.get_json()
	order_id = data.get("order_id")
	payment_method = data.get("payment_method_id")
	user_id = int(get_jwt_identity())
	
	payment = None
	order = None
	try:
		order = OrderModel.query.get(order_id)
		if not order:
			raise ResourceCustomError("not_found", "pedido")
		
		if order.user_id != user_id:
			raise AuthCustomError("forbidden_action", "realizar un pago para un pedido de otro usuario")
		
		if not order.payment_id and order.status != "paid":
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
@jwt_required()
def get_payment(payment_id):
	user_id = get_jwt_identity()
	payment = get_payment_intent(payment_id)
	if payment.metadata.get("user_id") != user_id:
		raise AuthCustomError("forbidden_action", "acceder a un pago de otro usuario")
	return payment_response_success(payment.id, payment.client_secret, payment.status)


@payments.route("/webhook", methods=["POST"])
def stripe_webhook_handler():
	payload = request.data
	sig_header = request.headers.get("Stripe-Signature")
	endpoint_secret = WEBHOOK_SECRET_STRIPE
	
	order = None
	payment = None
	try:
		event = create_webhook_event(payload, sig_header, endpoint_secret)
		
		payment = event.data.object
		order = OrderModel.query.filter_by(payment_id=payment["id"]).first()
		if not order:
			raise ResourceCustomError("not_found", "pedido")
		
		if event.type == "payment_intent.succeeded":
			order.status = "paid"
		elif event.type in ["payment_intent.requires_action", "payment_intent.processing"]:
			order.status = "pending"
		else:
			order.status = "failed"
		
		db.session.commit()
		
		return "", 200
	except ValueError:
		raise ResourceCustomError("invalid_data", "payload")
	except Exception as e:
		raise e
