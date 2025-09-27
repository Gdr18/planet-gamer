from ..utils.instantiations import db


class OrderDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    qty = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(precision=10, scale=2, asdecimal=False), nullable=False)
    details_game_id = db.Column(db.Integer, db.ForeignKey('game.id'))
    details_order_id = db.Column(db.Integer, db.ForeignKey('order.id'))

    def __init__(self, details_order_id, qty, price, details_game_id):
        self.qty = qty
        self.price = price
        self.details_game_id = details_game_id
        self.details_order_id = details_order_id
