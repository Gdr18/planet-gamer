from flask import Blueprint, request, jsonify

from ..services.db_service import db, add_order_and_items
from ..services.stripe_service import payment_process

payments = Blueprint("payments", __name__, url_prefix="/payments")


@payments.route("/checkout", methods=["POST"])
def checkout_payment():
	data = request.get_json()
	
	order_data = data.get("order")
	items_data = data.get("items")
	
	new_order = add_order_and_items(order_data, items_data)
	print(new_order.id)
	
	payment = None
	try:
		payment = payment_process(new_order, data.get("payment_method_id"))
		print(payment)
		
		new_order.status = ("succeeded" if payment.status == "succeeded" else "pending")
		
		return jsonify(msg="Transacción realizada correctamente"), 200
	except Exception as e:
		new_order.status = "failed"
		raise e
	finally:
		if payment:
			new_order.payment_id = payment.id
		db.session.commit()
