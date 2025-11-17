from marshmallow import ValidationError, pre_load

from src.services.db_service import ma
from ..models.address_model import AddressModel


class AddressSchema(ma.SQLAlchemyAutoSchema):
	class Meta:
		model = AddressModel
		include_fk = True
		dump_only = ["id"]
	
	@pre_load
	def validate_user_id(self, data, **kwargs):
		expected_user_id = self.context.get("expected_user_id")
		if expected_user_id and (
			str(data.get("address_user_id")) != str(expected_user_id)
		):
			raise ValidationError("No se puede modificar el campo 'user_id'.")
		return data
