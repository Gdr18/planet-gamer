from datetime import datetime

from src.core.extensions import db


class GameModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	title = db.Column(db.String(50), unique=True, nullable=False)
	description = db.Column(db.String(2000), unique=True, nullable=False)
	platform = db.Column(db.String(20), nullable=False, index=True)
	gender = db.Column(db.String(30), nullable=False)
	pegi = db.Column(db.String(3), nullable=False)
	release = db.Column(db.String(30), nullable=False)
	price = db.Column(db.Numeric(precision=10, scale=2, asdecimal=True), nullable=False)
	img_url = db.Column(db.String(150), unique=True, nullable=False)
	stock = db.Column(db.Integer, nullable=False, default=20)
	created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
	items_order = db.relationship("OrderItemModel", backref="game", lazy="raise")
