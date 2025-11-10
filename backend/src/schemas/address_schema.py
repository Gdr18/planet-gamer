from marshmallow import ValidationError, pre_load

from ..utils.instantiations import ma
from ..models.address_model import AddressModel


class AddressSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = AddressModel
        include_fk = True
        dump_only = ["id"]

    @pre_load
    def validate_address_user_id(self, data, **kwargs):
        expected_address_user_id = self.context.get("expected_address_user_id")
        if expected_address_user_id and (
            str(data["address_user_id"]) != str(expected_address_user_id)
        ):
            raise ValidationError("No se puede modificar el campo 'address_user_id'.")
        return data
