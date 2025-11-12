from marshmallow import pre_load, ValidationError, validate

from src.services.db_service import ma
from ..models.order_model import OrderModel

status_order = ["pendent", "paid", "failed"]


class OrderSchema(ma.SQLAlchemyAutoSchema):
	total = ma.Decimal(as_string=True, places=2, required=True, allow_none=False)
	created_at = ma.DateTime(dump_only=True, format="%d-%m-%Y %H:%M:%S")
	expires_at = ma.DateTime(dump_only=True, format="%d-%m-%Y %H:%M:%S")
	status = ma.String(validate=validate.OneOf(status_order))
	
	class Meta:
		model = OrderModel
		include_fk = True
		dump_only = ["id"]
	
	@pre_load
	def validate_data(self, data, **kwargs):
		expected_user_id = self.context.get("expected_user_id")
		if expected_user_id and (str(data.get("user_id")) != str(expected_user_id)):
			raise ValidationError("No se puede modificar el campo 'user_id'.")
		return data
