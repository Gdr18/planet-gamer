from ..utils.instantiations import db
from ..models.order_details_model import OrderDetailsModel

from datetime import datetime


class OrderModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    total = db.Column(db.Numeric(precision=10, scale=2, asdecimal=True), nullable=False)
    address_id = db.Column(db.Integer, db.ForeignKey("address_model.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("user_model.id"))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    order_details = db.relationship(
        OrderDetailsModel, cascade="all, delete", backref="order", lazy=True
    )

    def __init__(self, total, address_id, user_id):
        self.total = total
        self.address_id = address_id
        self.user_id = user_id
