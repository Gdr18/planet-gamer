from marshmallow import validate

from src.core.extensions import ma
from ..models.game_model import GameModel
from ..schemas.order_item_schema import OrderItemSchema

platforms = ["Nintendo Switch", "PlayStation 4", "PlayStation 5", "Xbox Series"]


class GameSchema(ma.SQLAlchemyAutoSchema):
	title = ma.String(required=True, validate=validate.Length(min=1, max=50))
	created_at = ma.DateTime(dump_only=True, format="%d-%m-%Y %H:%M:%S", data_key="createdAt")
	price = ma.Decimal(as_string=True, places=2, required=True,
	                   validate=validate.Range(min=0.1,
	                                           error="El campo 'price' debe ser un entero positivo mayor que cero."))
	platform = ma.String(required=True, validate=validate.OneOf(platforms))
	img_url = ma.String(required=True, data_key="imgUrl", validate=validate.Regexp(regex=r"^https?:\/\/\S+",
	                                                                               error="El campo 'imgUrl' debe ser una URL válida."))
	description = ma.String(required=True, validate=validate.Length(min=1, max=2000))
	gender = ma.String(required=True, validate=validate.Length(min=1, max=30))
	pegi = ma.String(required=True, validate=validate.Regexp(regex=r"^\+\d+\b",
	                                                         error="El campo 'pegi' debe empezar con '+' seguido de una edad, por ejemplo: +18."))
	release = ma.String(required=True, validate=validate.Regexp(
		regex=r"^(0?[1-9]|[12][0-9]|3[01]) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de \d{4}$",
		error="El campo 'release' debe ser una fecha con el siguiente formato: '22 de enero de 2024'."))
	
	class Meta:
		model = GameModel
		dump_only = ["id", "created_at", "items_order"]
		unknown = "exclude"


class GameFullSchema(GameSchema):
	items_order = ma.Nested(OrderItemSchema, many=True, exclude=["game_id"])
