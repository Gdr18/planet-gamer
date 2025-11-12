from marshmallow import validate

from src.services.db_service import ma
from ..models.game_model import GameModel

platforms = ["Nintendo Switch", "PlayStation 4", "PlayStation 5", "XBOX X/S"]


class GameSchema(ma.SQLAlchemyAutoSchema):
	created_at = ma.DateTime(dump_only=True, format="%d-%m-%Y %H:%M:%S")
	price = ma.Decimal(as_string=True, places=2, required=True, allow_none=False)
	platform = ma.String(required=True, validate=validate.OneOf(platforms))
	
	class Meta:
		model = GameModel
		dump_only = ["id"]
