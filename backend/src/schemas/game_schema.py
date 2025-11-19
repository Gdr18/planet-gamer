from marshmallow import validate

from src.services.db_service import ma
from ..models.game_model import GameModel

platforms = ["Nintendo Switch", "PlayStation 4", "PlayStation 5", "XBOX X/S"]


# TODO: Campos específicos para gender?

class GameSchema(ma.SQLAlchemyAutoSchema):
	title = ma.String(required=True, validate=validate.Length(min=1, max=50))
	created_at = ma.DateTime(dump_only=True, format="%d-%m-%Y %H:%M:%S", data_key="createdAt")
	price = ma.Decimal(as_string=True, places=2, required=True,
	                   validate=validate.Range(min=0.1, error="El campo 'price' debe ser un número positivo."))
	platform = ma.String(required=True, validate=validate.OneOf(platforms))
	img_url = ma.String(required=True, data_key="imgUrl", validate=validate.Regexp(regex=r"^https?:\/\/\S+",
	                                                                               error="El campo 'imgUrl' debe ser una URL válida."))
	description = ma.String(required=True, validate=validate.Length(min=1, max=1500))
	gender = ma.String(required=True, validate=validate.Length(min=1, max=30))
	pegi = ma.String(required=True, validate=validate.Regexp(regex=r"^\+\d+\b",
	                                                         error="El campo 'pegi' debe empezar con '+' seguido de una edad, por ejemplo: +18."))
	release = ma.String(required=True, validate=validate.Regexp(regex=r"^\d{4}$",
	                                                            error="El campo 'release' debe ser un año válido de 4 dígitos."))
	
	class Meta:
		model = GameModel
		dump_only = ["id", "created_at"]
