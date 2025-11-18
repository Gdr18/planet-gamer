from datetime import datetime

from src.services.db_service import db
from ..models.item_order_model import ItemOrderModel


class GameModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	title = db.Column(db.String(50), unique=True, nullable=False)
	description = db.Column(db.String(1500), unique=True, nullable=False)
	platform = db.Column(db.String(20), nullable=False)
	gender = db.Column(db.String(30), nullable=False)
	pegi = db.Column(db.String(3), nullable=False)
	release = db.Column(db.String(4), nullable=False)
	price = db.Column(db.Numeric(precision=10, scale=2, asdecimal=True), nullable=False)
	img_url = db.Column(db.String(150), unique=True, nullable=False)
	stock = db.Column(db.Integer, nullable=False, default=20)
	created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
	details = db.relationship(ItemOrderModel, backref="game", lazy=True)
