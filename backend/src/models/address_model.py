from ..utils.instantiations import db
from ..models.order_model import OrderModel


class AddressModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    street = db.Column(db.String(100), nullable=False)
    second_line_street = db.Column(db.String(50))
    postal_code = db.Column(db.String(5), nullable=False)
    city = db.Column(db.String(40), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user_model.id"), nullable=False)
    default = db.Column(db.Boolean, nullable=False, default=False)
    orders = db.relationship(OrderModel, backref="address", lazy=True)

    def __init__(
        self, street, second_line_street, postal_code, city, user_id, default=None
    ):
        self.street = street
        self.second_line_street = second_line_street
        self.postal_code = postal_code
        self.city = city
        self.user_id = user_id
        self.default = default
