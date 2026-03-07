from src.core.extensions import db


class OrderItemModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	qty = db.Column(db.Integer, nullable=False)
	price_in_cents = db.Column(db.Integer, nullable=False)
	game_id = db.Column(db.Integer, db.ForeignKey("game_model.id"))
	order_id = db.Column(db.Integer, db.ForeignKey("order_model.id"))
	
	__table_args__ = (
		db.UniqueConstraint("game_id", "order_id", name="unique_game_order"),
	)
