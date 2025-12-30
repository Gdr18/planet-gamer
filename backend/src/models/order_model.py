from datetime import datetime

from ..core.extensions import db


class OrderModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	total = db.Column(db.Numeric(precision=10, scale=2, asdecimal=True), nullable=False)
	address_id = db.Column(db.Integer, db.ForeignKey("address_model.id"))
	user_id = db.Column(db.Integer, db.ForeignKey("user_model.id"), index=True)
	payment_id = db.Column(db.String(100))
	status = db.Column(db.String, nullable=False)
	created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
	
	items = db.relationship(
		"OrderItemModel", cascade="all, delete", backref="order", lazy="joined"
	)
	
	def __init__(self, total, address_id, user_id, status="pending", payment_id=None):
		self.total = total
		self.address_id = address_id
		self.user_id = user_id
		self.status = status
		self.payment_id = payment_id
