from marshmallow import validate, pre_load, ValidationError

from ..core.enums import RoleType
from ..core.extensions import ma
from ..models.user_role_model import UserRoleModel


class UserRoleSchema(ma.SQLAlchemyAutoSchema):
	email = ma.Email(
		required=True,
		primary_key=True,
		unique=True,
		validate=validate.Length(min=1, max=100, error="El campo 'email' debe tener entre 1 y 100 caracteres."),
		index=True
	)
	role = ma.Integer(
		required=True,
		validate=validate.OneOf([role.value for role in RoleType], error="El campo 'role' debe ser un rol válido.")
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
	
	@pre_load
	def validate_and_transform_role(self, data, **kwargs):
		role_value = data.get("role")
		
		if role_value in [role.name.lower() for role in RoleType]:
			data["role"] = RoleType[role_value]
			return data
		
		raise ValidationError("El campo 'role' debe ser un rol válido: 'admin', 'staff' o 'customer'.")
