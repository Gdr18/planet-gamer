from marshmallow import validate

from src.core.extensions import ma


class PaymentSchema(ma.Schema):
	payment_method_id = ma.String(required=True, data_key="paymentMethodId",
	                              validate=validate.Regexp(r"^pm_[A-Za-z0-9]{24}$",
	                                                       error="El campo 'payment_id' debe comenzar por 'pm' seguido de caracteres alfanuméricos: 'pm_XXXXXXXXXXXXXXXXXXXXXXXX'."))
