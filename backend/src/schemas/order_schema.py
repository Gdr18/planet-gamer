from marshmallow import pre_load, ValidationError, validate

from src.core.extensions import ma
from ..models.order_model import OrderModel
from ..schemas.order_item_schema import OrderItemSchema

status_order = ["pending", "paid", "failed"]


class OrderSchema(ma.SQLAlchemyAutoSchema):
	total_in_cents = ma.Integer(required=True, data_key="totalInCents", validate=validate.Range(min=1,
	                                                                                            error="El campo 'totalInCents' debe ser un entero positivo."))
	addressee = ma.String(required=True, validate=validate.Length(min=1, max=150))
	phone_number = ma.String(
		validate=validate.Regexp(regex=r"^(?:\+34\s?)?(6\d{8}|7[1-9]\d{7})$",
		                         error="El campo 'phone_number' no cumple con el patrón, ejemplos válidos: '666666666' o '+34666666666'"),
		data_key="phoneNumber"
	)
	address_id = ma.Integer(required=True, foreign_key="address_model.id", data_key="addressId",
	                        validate=validate.Range(min=1,
	                                                error="El campo 'addressId' debe ser un entero positivo mayor que 0."))
	user_id = ma.Integer(required=True, foreign_key="user_model.id", data_key="userId", validate=validate.Range(min=1,
	                                                                                                            error="El campo 'userId' debe ser un entero positivo mayor que 0."))
	payment_id = ma.String(data_key="paymentId", allow_none=True, validate=validate.Length(min=1, max=100,
	                                                                                       error="El campo 'paymentId' debe tener entre 1 y 100 caracteres."))
	created_at = ma.DateTime(format="%d-%m-%Y %H:%M:%S", data_key="createdAt")
	status = ma.String(validate=validate.OneOf(status_order))
	items = ma.Nested(OrderItemSchema, many=True, exclude=["order_id"])
	
	class Meta:
		model = OrderModel
		dump_only = ["id", "created_at"]
		unknown = "exclude"
	
	@pre_load
	def validate_data(self, data, **kwargs):
		expected_user_id = self.context.get("expected_user_id")
		if expected_user_id and data.get("user_id") and (str(data.get("user_id")) != str(expected_user_id)):
			raise ValidationError("El campo 'user_id' no se puede modificar.")
		return data
