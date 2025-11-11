from marshmallow import ValidationError, pre_load

from src.services.db_service import ma
from ..models.item_basket_model import ItemBasketModel


class ItemBasketSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ItemBasketModel
        include_fk = True
        dump_only = ["id"]

    @pre_load
    def validate_data(self, data, **kwargs):
        expected_game_id = self.context.get("expected_user_id")
        expected_user_id = self.context.get("expected_user_id")
        if expected_game_id and (str(data.get("game_id")) != str(expected_game_id)):
            raise ValidationError("No se puede modificar el campo 'game_id'.")
        if expected_user_id and (str(data.get("user_id")) != str(expected_user_id)):
            raise ValidationError("No se puede modificar el campo 'user_id'.")
        return data
