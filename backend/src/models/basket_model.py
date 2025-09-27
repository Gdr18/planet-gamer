from ..utils.instantiations import db


class Basket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    qty = db.Column(db.Integer, nullable=False)
    basket_game_id = db.Column(db.Integer, db.ForeignKey("game.id"))
    basket_user_id = db.Column(db.Integer, db.ForeignKey("user.id"))

    def __init__(self, qty, basket_game_id, basket_user_id):
        self.qty = qty
        self.basket_game_id = basket_game_id
        self.basket_user_id = basket_user_id
