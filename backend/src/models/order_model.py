from ..utils.instantiations import db
from datetime import datetime


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    total = db.Column(
        db.Numeric(precision=10, scale=2, asdecimal=False), nullable=False
    )
    date = db.Column(db.DateTime, nullable=False, default=datetime.now)
    order_address_id = db.Column(db.Integer, db.ForeignKey("address.id"))
    order_user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    details = db.relationship('OrderDetails', cascade="all, delete", backref='order', lazy=True)

    def __init__(self, total, order_address_id, order_user_id):
        self.total = total
        self.order_address_id = order_address_id
        self.order_user_id = order_user_id
