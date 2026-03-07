from datetime import datetime
from zoneinfo import ZoneInfo

from ..core.extensions import db


class OrderModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	total_in_cents = db.Column(db.Integer, nullable=False)
	addressee = db.Column(db.String(150), nullable=False)
	phone_number = db.Column(db.String(14), nullable=False)
	address_id = db.Column(db.Integer, db.ForeignKey("address_model.id"))
	user_id = db.Column(db.Integer, db.ForeignKey("user_model.id"), index=True)
	payment_id = db.Column(db.String(100))
	status = db.Column(db.String, nullable=False)
	created_at = db.Column(db.DateTime(timezone=True), nullable=False,
	                       default=lambda: datetime.now(ZoneInfo("Europe/Madrid")))
	
	items = db.relationship(
		"OrderItemModel", cascade="all, delete", backref="order", lazy="joined"
	)
	
	def __init__(self, total, addressee, phone_number, address_id, user_id, status="pending", payment_id=None):
		self.total = total
		self.addressee = addressee
		self.phone_number = phone_number
		self.address_id = address_id
		self.user_id = user_id
		self.status = status
		self.payment_id = payment_id
