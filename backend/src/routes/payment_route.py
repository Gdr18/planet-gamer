from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, current_user

from config import WEBHOOK_SECRET_STRIPE
from ..core.api_responses import payment_response_success
from ..core.enums import RoleType
from ..core.exceptions.custom_exceptions import ResourceCustomError, StripeCustomError, AuthCustomError
from ..core.extensions import db
from ..models.order_model import OrderModel
from ..schemas.order_schema import OrderSchema
from ..schemas.payment_schema import PaymentSchema
from ..services.order_service import OrderService
from ..services.stripe_service import create_payment_intent, confirm_payment_intent, get_payment_intent, \
	create_webhook_event

payments = Blueprint("payments", __name__, url_prefix="/payments")


@payments.route("/checkout", methods=["POST"])
@jwt_required()
def checkout():
	data = request.get_json()
	order_data = data.get("order")
	items_order_data = data.get("items")
	payment_data = data.get("payment")
	
	if current_user.role != RoleType.ADMIN.value and order_data["userId"] != current_user.id:
		raise AuthCustomError("forbidden_action", "crear un pedido para otro usuario")
	
	payment_object = PaymentSchema().load(payment_data)
	
	order = OrderService.post_order_and_items(order_data, items_order_data)
	
	try:
		create_payment = create_payment_intent(order)
		order.payment_id = create_payment.id
		db.session.commit()
		
		confirm_payment = confirm_payment_intent(create_payment.id, payment_object["payment_method_id"])
		
		if confirm_payment.status not in ["succeeded", "requires_action", "processing"]:
			raise StripeCustomError(confirm_payment.status)
		return payment_response_success(confirm_payment.id, confirm_payment.client_secret, confirm_payment.status,
		                                OrderSchema().dump(order))
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
