import stripe

from config import API_KEY_STRIPE
from ..models.order_model import OrderModel

stripe.api_key = API_KEY_STRIPE


def create_payment(order_instance: OrderModel) -> stripe.PaymentIntent:
	payment_attr = {
		"amount": int(order_instance.total * 100),
		"currency": "eur",
		"payment_method_types": ["card"],
		"metadata": {
			"user_id_db": order_instance.user_id,
			"order_id_db": order_instance.id
		},
	}
	
	return stripe.PaymentIntent.create(**payment_attr)


def confirm_payment(payment_intent_id: str, payment_method_id: str | None) -> stripe.PaymentIntent:
	return stripe.PaymentIntent.confirm(payment_intent_id, payment_method=payment_method_id)


def create_webhook_event(payload: bytes, sig_header: str, endpoint_secret: str) -> stripe.Event:
	return stripe.Webhook.construct_event(
		payload, sig_header, endpoint_secret
	)
