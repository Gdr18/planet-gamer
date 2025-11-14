from flask import Blueprint, request

from ..exceptions.custom_exceptions import ValidationCustomError, StripeCustomError
from ..models.order_model import OrderModel
from ..schemas.order_schema import OrderSchema
from ..services.db_service import db
from ..services.stripe_service import create_payment, confirm_payment

payments = Blueprint("payments", __name__, url_prefix="/payments")


@payments.route("/checkout", methods=["POST"])
def checkout():
	data = request.get_json()
	order_id = data.get("order_id")
	payment_method = data.get("payment_method_id")
	
	payment = None
	order = None
	try:
		order = OrderModel.query.get(order_id)
		if not order:
			return ValidationCustomError("not_found", "pedido").json_response()
		
		if not payment_method and not order.payment_id:
			return StripeCustomError("required_payment_method").json_response()
		
		if not order.payment_id:
			payment = create_payment(order)
			order.payment_id = payment.id
		
		payment = confirm_payment(order.payment_id, payment_method)
		
		if not payment.status == "succeeded":
			return StripeCustomError(payment.status, payment.client_secret).json_response()
		
		order.status = "paid"
		order.expires_at = None
		return OrderSchema().dump(order), 200
	except Exception as e:
		raise e
	finally:
		if (order and not payment) or (payment and payment.status not in ["succeeded", "requires_action"]):
			order.status = "failed"
		db.session.commit()
