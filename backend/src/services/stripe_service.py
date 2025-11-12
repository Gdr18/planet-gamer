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
		"confirmation_method": "manual",
		"confirm": True,
		"metadata": {
			"user_id_db": order_instance.user_id,
			"order_id_db": order_instance.id
		},
	}
	
	return stripe.PaymentIntent.create(**payment_attr)
