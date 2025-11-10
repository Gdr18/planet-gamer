from ..utils.instantiations import db


class ItemBasketModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    qty = db.Column(db.Integer, nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey("game_model.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("user_model.id"))

    def __init__(self, qty, game_id, user_id):
        self.qty = qty
        self.game_id = game_id
        self.user_id = user_id
