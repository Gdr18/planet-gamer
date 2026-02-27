from marshmallow import validate

from src.core.extensions import ma


class PaymentSchema(ma.Schema):
	order_id = ma.Integer(required=True, data_key="orderId")
	payment_method_id = ma.String(required=True, data_key="paymentMethodId",
	                              validate=validate.Regexp(r"^pm_[A-Za-z0-9]{24}$",
	                                                       error="El campo 'payment_id' debe comenzar por 'pm' seguido de caracteres alfanuméricos: 'pm_XXXXXXXXXXXXXXXXXXXXXXXX'."))
