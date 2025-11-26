from marshmallow import validate, pre_load, ValidationError

from ..core.enums import RoleType
from ..core.extensions import ma
from ..models.user_role_model import UserRoleModel


class UserRoleSchema(ma.SQLAlchemyAutoSchema):
	email = ma.Email(
		required=True,
		foreign_key="user_model.email",
		primary_key=True,
		validate=validate.Length(min=1, max=100, error="El campo 'email' debe tener entre 1 y 100 caracteres."),
	)
	role = ma.Integer(
		required=True, validate=validate.OneOf(list(RoleType))
	)
	
	class Meta:
		model = UserRoleModel
		unknown = "exclude"
	
	@pre_load
	def validate_email(self, data, **kwargs):
		expected_email = self.context.get("expected_email")
		if (
			expected_email
			and data.get("email")
			and (str(expected_email) != str(data.get("email")))
		):
			raise ValidationError("El campo 'email' no se puede modificar.")
		return data
