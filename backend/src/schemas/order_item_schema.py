from marshmallow import pre_load, ValidationError, validate

from src.core.extensions import ma
from ..models.order_item_model import OrderItemModel


class OrderItemSchema(ma.SQLAlchemyAutoSchema):
	price = ma.Decimal(as_string=True, places=2, required=True, validate=validate.Range(min=0.01,
	                                                                                    error="El campo 'price' debe ser un entero positivo mayor que cero."))
	qty = ma.Integer(required=True, validate=validate.Range(min=1, error="El campo 'qty' debe ser un entero positivo."))
	game_id = ma.Integer(required=True, foreign_key="game_model.id", data_key="gameId",
	                     validate=validate.Range(min=1, error="El campo 'game_id' debe ser un entero positivo."))
	order_id = ma.Integer(required=True, foreign_key="order_model.id", data_key="orderId",
	                      validate=validate.Range(min=1, error="El campo 'order_id' debe ser un entero positivo."))
	
	class Meta:
		model = OrderItemModel
		dump_only = ["id"]
		unknown = "exclude"
	
	@pre_load
	def validate_data(self, data, **kwargs):
		expected_game_id = self.context.get("expected_game_id")
		expected_order_id = self.context.get("expected_order_id")
		if expected_game_id and data.get("game_id") and (str(data.get("game_id")) != str(expected_game_id)):
			raise ValidationError("El campo 'game_id' no se puede modificar.")
		if expected_order_id and data.get("order_id") and (str(data.get("order_id")) != str(expected_order_id)):
			raise ValidationError("El campo 'order_id' no se puede modificar.")
		return data
