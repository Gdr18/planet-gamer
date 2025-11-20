from datetime import datetime, timedelta

from ..models.item_order_model import ItemOrderModel
from ..services.db_service import db


# TODO: Eliminación de fila automática basándose en el campo 'expires_at' desde Supabase
class OrderModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	total = db.Column(db.Numeric(precision=10, scale=2, asdecimal=True), nullable=False)
	address_id = db.Column(db.Integer, db.ForeignKey("address_model.id"))
	user_id = db.Column(db.Integer, db.ForeignKey("user_model.id"))
	payment_id = db.Column(db.String(100))
	status = db.Column(db.String, nullable=False)
	created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
	expires_at = db.Column(db.DateTime)
	
	items_order = db.relationship(
		ItemOrderModel, cascade="all, delete", backref="order", lazy=True
	)
	
	def __init__(self, total, address_id, user_id, status="pending", payment_id=None):
		self.total = total
		self.address_id = address_id
		self.user_id = user_id
		self.status = status
		self.payment_id = payment_id
		
		if self.status != "paid":
			self.expires_at = datetime.now() + timedelta(hours=24)
