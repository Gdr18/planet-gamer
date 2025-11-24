from src.extensions import db

from ..models.address_model import AddressModel
from ..models.order_model import OrderModel
from ..models.user_role_model import UserRoleModel

ROLE_TYPES = {"admin": 1, "staff": 2, "customer": 3}


class UserModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	email = db.Column(db.String(100), unique=True, nullable=False)
	name = db.Column(db.String(50), nullable=False)
	password = db.Column(db.String(200), nullable=False)
	surnames = db.Column(db.String(100))
	phone_number = db.Column(db.String(12))
	addresses = db.relationship(
		AddressModel, cascade="all, delete", backref="user", lazy="subquery"
	)
	orders = db.relationship(
		OrderModel, cascade="all, delete", backref="user", lazy="selectin"
	)
	user_role = db.relationship(
		UserRoleModel, cascade="all, delete", backref="user", lazy="joined", uselist=False
	)
	
	@property
	def role(self):
		return self.user_role.role if self.user_role else ROLE_TYPES["customer"]
	
	def __init__(self, email, name, password, surnames=None, phone_number=None):
		self.email = email
		self.name = name
		self.password = password
		self.surnames = surnames
		self.phone_number = phone_number
