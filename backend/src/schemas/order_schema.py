from marshmallow import pre_load, ValidationError, validate

from src.services.db_service import ma
from ..models.order_model import OrderModel
from ..schemas.item_order_schema import ItemOrderSchema

status_order = ["pending", "paid", "failed"]


class OrderSchema(ma.SQLAlchemyAutoSchema):
	total = ma.Decimal(as_string=True, places=2, required=True, validate=validate.Range(min=0.1,
	                                                                                    error="El campo 'total' debe ser un entero positivo mayor que 0."))
	address_id = ma.Integer(required=True, foreign_key="address_model.id", data_key="addressId",
	                        validate=validate.Range(min=1,
	                                                error="El campo 'addressId' debe ser un entero positivo mayor que 0."))
	user_id = ma.Integer(required=True, foreign_key="user_model.id", data_key="userId", validate=validate.Range(min=1,
	                                                                                                            error="El campo 'userId' debe ser un entero positivo mayor que 0."))
	payment_id = ma.String(data_key="paymentId", allow_none=True, validate=validate.Length(min=1, max=100,
	                                                                                       error="El campo 'paymentId' debe tener entre 1 y 100 caracteres."))
	created_at = ma.DateTime(format="%d-%m-%Y %H:%M:%S", data_key="createdAt")
	expires_at = ma.DateTime(format="%d-%m-%Y %H:%M:%S", data_key="expiresAt")
	status = ma.String(validate=validate.OneOf(status_order))
	items = ma.Nested(ItemOrderSchema, many=True, exclude=["order_id"])
	
	class Meta:
		model = OrderModel
		dump_only = ["id", "created_at", "expires_at"]
		unknown = "exclude"
		include_relationships = True
	
	@pre_load
	def validate_data(self, data, **kwargs):
		expected_user_id = self.context.get("expected_user_id")
		if expected_user_id and data.get(expected_user_id) and (str(data.get("user_id")) != str(expected_user_id)):
			raise ValidationError("El campo 'user_id' no se puede modificar.")
		return data
