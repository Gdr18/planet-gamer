from src.core.extensions import db


class UserRoleModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	email = db.Column(db.String(100), nullable=False, unique=True, index=True)
	role = db.Column(db.Integer, nullable=False)
