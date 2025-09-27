from ..utils.instantiations import db


class Address(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    street = db.Column(db.String(100), nullable=False)
    second_line_street = db.Column(db.String(50))
    postal_code = db.Column(db.String(5), nullable=False)
    city = db.Column(db.String(40), nullable=False)
    address_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)
    orders = db.relationship('Order', backref='address', lazy=True)

    def __init__(self, street, second_line_street, postal_code, city, address_user_id):
        self.street = street
        self.second_line_street = second_line_street
        self.postal_code = postal_code
        self.city = city
        self.address_user_id = address_user_id

