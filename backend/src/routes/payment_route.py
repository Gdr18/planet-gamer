from flask import Blueprint, request, jsonify, current_app

from ..models.order_model import OrderModel
from ..services.db_service import db, add_order_and_items
from ..services.stripe_service import payment_process, retrieve_payment_process, create_webhook_event

payments = Blueprint("payments", __name__, url_prefix="/payments")


@payments.route("/checkout", methods=["POST"])
def checkout():
	data = request.get_json()
	
	order_data = data.get("order")
	items_data = data.get("items")
	
	new_order = add_order_and_items(order_data, items_data)
	
	payment = None
	try:
		payment = payment_process(new_order, data.get("payment_method_id"))
		print(payment)
		
		if payment.status == "succeeded":
			new_order.status = "paid"
			new_order.expires_at = None
		elif payment.status == "requires_action":
			return jsonify(err="pay_req_action", client_secret=payment.client_secret), 400
		else:
			raise Exception("Payment failed")
		
		return jsonify(new_order), 200
	except Exception as e:
		new_order.status = "failed"
		raise e
	finally:
		if payment:
			new_order.payment_id = payment.id
		db.session.commit()


@payments.route("/retrieve-checkout", methods=["POST"])
def retrieve_checkout():
	data = request.get_json()
	
	try:
		payment = retrieve_payment_process(data.get("payment_intent_id"), data.get("payment_method_id"))
		
		if payment.status == "succeeded":
			order = OrderModel.query.filter_by(id=payment.metadata.get("order_id_db")).first()
			order.status = "paid"
			order.expires_at = None
			db.session.commit()
			return jsonify(order), 200
		elif payment.status == "requires_action":
			return jsonify(err="pay_req_action", client_secret=payment.client_secret), 400
		else:
			raise Exception("Payment failed")
	except Exception as e:
		raise e


@payments.route("/stripe-webhook", methods=["POST"])
def stripe_webhook():
	payload = request.data
	sig_header = request.headers.get("Stripe-Signature")
	# TODO: Configurar variable de entorno
	webhook_secret = current_app.config.get("STRIPE_WEBHOOK_SECRET")
	
	# Validar firma del webhook
	try:
		event = create_webhook_event(payload, sig_header, webhook_secret)
	except ValueError:
		return jsonify({"error": "Invalid payload"}), 400
	
	event_data = event.get("data")
	event_type = event.get("type")
	order = OrderModel
	if event_type == "payment_intent.succeeded":
	
	# Extrae objeto y metadata común
	data_object = event.get("data", {}).get("object", {})
	
