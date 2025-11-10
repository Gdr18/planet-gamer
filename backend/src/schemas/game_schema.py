from ..utils.instantiations import ma
from ..models.game_model import GameModel


class GameSchema(ma.SQLAlchemyAutoSchema):
    created_at = ma.DateTime(dump_only=True, format="%d-%m-%Y, %H:%M:%S")

    class Meta:
        model = GameModel
        dump_only = ["id"]
