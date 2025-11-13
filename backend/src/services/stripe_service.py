import stripe

from config import API_KEY_STRIPE
from ..models.order_model import OrderModel

stripe.api_key = API_KEY_STRIPE


def payment_process(order_instance: OrderModel, payment_method_id: str) -> stripe.PaymentIntent:
	payment_attr = {
		"amount": int(order_instance.total * 100),
		"currency": "eur",
		"payment_method_types": ["card"],
		"payment_method": payment_method_id,
		"confirm": True,
		"metadata": {
			"user_id_db": order_instance.user_id,
			"order_id_db": order_instance.id
		},
	}
	
	return stripe.PaymentIntent.create(**payment_attr)


def retrieve_payment_process(payment_intent_id: str, payment_method_id: str) -> stripe.PaymentIntent:
	payment_attr = {
		"payment_intent": payment_intent_id,
		"payment_method": payment_method_id,
	}
	return stripe.PaymentIntent.retrieve(**payment_attr)


def create_webhook_event(payload: bytes, sig_header: str, endpoint_secret: str) -> stripe.Event:
	return stripe.Webhook.construct_event(
		payload, sig_header, endpoint_secret
	)
