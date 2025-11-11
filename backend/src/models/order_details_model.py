from src.services.db_service import db


class OrderDetailsModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    qty = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(precision=10, scale=2, asdecimal=True), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey("game_model.id"))
    order_id = db.Column(db.Integer, db.ForeignKey("order_model.id"))

    __table_args__ = (
        db.UniqueConstraint("game_id", "order_id", name="unique_game_order"),
    )

    def __init__(self, order_id, qty, price, game_id):
        self.qty = qty
        self.price = price
        self.game_id = game_id
        self.order_id = order_id
