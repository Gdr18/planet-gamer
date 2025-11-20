import re

from marshmallow import pre_load, ValidationError, validate

from src.services.db_service import ma
from ..models.user_model import UserModel


class UserSchema(ma.SQLAlchemyAutoSchema):
	email = ma.Email(required=True, validate=validate.Length(max=100))
	phone_number = ma.String(
		validate=validate.Regexp(r"^(?:\+34\s?)?(6\d{8}|7[1-9]\d{7})$"),
	)
	
	class Meta:
		model = UserModel
		dump_only = ["id", "role"]
		unknown = "exclude"
		include_relationships = True
	
	@pre_load
	def validate_values(self, data, **kwargs):
		expected_password = self.context.get("expected_password")
		
		regex_password_hash = re.compile(r"^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$")
		regex_password = re.compile(
			r'^(?=.*[a-záéíóúüñ])(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{}|;:\'",.<>?/]).{7,}$',
			re.UNICODE,
		)
		
		if not re.match(regex_password, expected_password) and not re.match(
			regex_password_hash, expected_password
		):
			raise ValidationError("La contraseña no es válida")
		return data
