from src.extensions import db
from ..models.user_role_model import UserRoleModel

ROLE_TYPES = {"admin": 1, "staff": 2, "customer": 3}


class UserModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	email = db.Column(db.String(100), unique=True, nullable=False, index=True)
	name = db.Column(db.String(50), nullable=False)
	password = db.Column(db.String(200), nullable=False)
	surnames = db.Column(db.String(100), default=None)
	phone_number = db.Column(db.String(12), default=None)
	addresses = db.relationship(
		"AddressModel", cascade="all, delete", backref="user", lazy="raise"
	)
	orders = db.relationship(
		"OrderModel", backref="user", lazy="raise"
	)
	user_role = db.relationship(
		UserRoleModel, lazy="joined", uselist=False
	)
	basket = db.relationship(
		"ItemBasketModel", cascade="all, delete", backref="user", lazy="raise"
	)
	
	@property
	def role(self):
		return self.user_role.role if self.user_role else ROLE_TYPES["customer"]
