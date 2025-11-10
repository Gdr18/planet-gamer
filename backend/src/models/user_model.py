from ..utils.instantiations import db

from ..models.address_model import AddressModel
from ..models.order_model import OrderModel

customer_role = 3


class UserModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.Integer, default=customer_role, nullable=False)
    surnames = db.Column(db.String(100))
    phone_number = db.Column(db.String(12))
    addresses = db.relationship(
        AddressModel, cascade="all, delete", backref="user", lazy=True
    )
    orders = db.relationship(
        OrderModel, cascade="all, delete", backref="user", lazy=True
    )

    def __init__(self, email, name, password, surnames=None, phone_number=None):
        self.email = email
        self.name = name
        self.password = password
        self.surnames = surnames
        self.phone_number = phone_number

        from ..models.user_role_model import UserRoleModel

        user_role = db.session.query(UserRoleModel).filter_by(email=email).first()
        self.role = user_role.user_roles if user_role else None
