from marshmallow import ValidationError, pre_load, validate

from src.services.db_service import ma
from ..models.item_basket_model import ItemBasketModel


class ItemBasketSchema(ma.SQLAlchemyAutoSchema):
	qty = ma.Integer(required=True, validate=validate.Range(min=1, error="El campo 'qty' debe ser un entero positivo."))
	game_id = ma.Integer(required=True, data_key="gameId",
	                     validate=validate.Range(min=1, error="El campo 'game_id' debe ser un entero positivo."))
	user_id = ma.Integer(required=True, data_key="userId",
	                     validate=validate.Range(min=1, error="El campo 'user_id' debe ser un entero positivo."))
	
	class Meta:
		model = ItemBasketModel
		dump_only = ["id"]
		unknown = "exclude"
	
	@pre_load
	def validate_data(self, data, **kwargs):
		expected_game_id = self.context.get("expected_game_id")
		expected_user_id = self.context.get("expected_user_id")
		if expected_game_id and data.get("game_id") and (str(data.get("game_id")) != str(expected_game_id)):
			raise ValidationError("El campo 'game_id' no se puede modificar.")
		if expected_user_id and data.get("user_id") and (str(data.get("user_id")) != str(expected_user_id)):
			raise ValidationError("El campo 'user_id' no se puede modificar.")
		return data
