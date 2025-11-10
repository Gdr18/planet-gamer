from marshmallow import validate, pre_load, ValidationError

from ..utils.instantiations import ma
from ..models.user_role_model import UserRoleModel, ROLE_TYPES


class UserRoleSchema(ma.SQLAlchemyAutoSchema):
    email = ma.Email(
        required=True, unique=True, validate=validate.Length(max=100), allow_none=False
    )
    role = ma.Integer(
        required=True, validate=validate.OneOf(ROLE_TYPES.values()), allow_none=False
    )

    class Meta:
        model = UserRoleModel
        dump_only = ["id"]

    @pre_load
    def validate_email(self, data, **kwargs):
        expected_email = self.context.get("expected_email")
        if expected_email and (str(expected_email) != str(data.get("email"))):
            raise ValidationError("No se puede modificar el campo 'email'.")
        return data
