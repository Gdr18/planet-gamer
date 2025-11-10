from marshmallow import ValidationError, pre_load

from ..utils.instantiations import ma
from ..models.address_model import Address


class AddressSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Address
        include_fk = True

    @pre_load
    def validate_data(self, data, **kwargs):
        mode = self.context.get("mode")

        if mode == "create":
            if "id" in data:
                raise ValidationError("No se puede establecer el campo 'id'.")
        elif mode == "update":
            expected_id = self.context.get("expected_id")
            expected_address_user_id = self.context.get("expected_address_user_id")
            if str(data["id"]) != str(expected_id):
                raise ValidationError("No se puede modificar el campo 'id'.")
            if str(data["address_user_id"]) != str(expected_address_user_id):
                raise ValidationError(
                    "No se puede modificar el campo 'address_user_id'."
                )
        return data
