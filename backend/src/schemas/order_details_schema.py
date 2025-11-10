from marshmallow import pre_load, ValidationError

from ..utils.instantiations import ma
from ..models.order_details_model import OrderDetailsModel


class OrderDetailsSchema(ma.SQLAlchemyAutoSchema):
    price = ma.Decimal(as_string=True, places=2, required=True, allow_none=False)

    class Meta:
        model = OrderDetailsModel
        include_fk = True
        dump_only = ["id"]

    @pre_load
    def validate_data(self, data, **kwargs):
        expected_game_id = self.context["expected_game_id"]
        expected_order_id = self.context["expected_order_id"]
        if expected_game_id and (str(data.get("game_id")) != str(expected_game_id)):
            raise ValidationError("No se puede modificar el campo 'game_id'.")
        if expected_order_id and (str(data.get("order_id")) != str(expected_order_id)):
            raise ValidationError("No se puede modificar el campo 'order_id'.")
        return data
