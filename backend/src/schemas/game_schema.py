from ..utils.instantiations import ma
from ..models.game_model import GameModel


class GameSchema(ma.SQLAlchemyAutoSchema):
    created_at = ma.DateTime(dump_only=True, format="%d-%m-%Y, %H:%M:%S")
    price = ma.Decimal(as_string=True, places=2, required=True, allow_none=False)

    class Meta:
        model = GameModel
        dump_only = ["id"]
