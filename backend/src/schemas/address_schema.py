from marshmallow import ValidationError, pre_load, validate

from src.core.extensions import ma
from ..models.address_model import AddressModel
from ..schemas.order_schema import OrderSchema


class AddressSchema(ma.SQLAlchemyAutoSchema):
	second_line_street = ma.String(data_key="secondLineStreet", validate=validate.Length(min=1, max=50),
	                               allow_none=True)
	user_id = ma.Integer(foreign_key="user_model.id", required=True, data_key="userId",
	                     validate=validate.Range(min=1, error="El campo 'userId' debe ser un entero positivo."))
	city = ma.String(required=True, validate=validate.Length(min=1, max=40))
	street = ma.String(required=True, validate=validate.Length(min=1, max=100))
	postal_code = ma.String(required=True, data_key="postalCode",
	                        validate=validate.Regexp(r"^\d{5}$",
	                                                 error="El campo 'postalCode' debe contener 5 dígitos."))
	
	class Meta:
		model = AddressModel
		dump_only = ["id"]
		unknown = "exclude"
	
	@pre_load
	def validate_user_id(self, data, **kwargs):
		expected_user_id = self.context.get("expected_user_id")
		if expected_user_id and data.get("user_id") and (
			str(data.get("user_id")) != str(expected_user_id)
		):
			raise ValidationError("El campo 'userId' no se puede modificar.")
		return data


class AddressFullSchema(AddressSchema):
	orders = ma.Nested(OrderSchema, many=True, exclude=["address_id"])
