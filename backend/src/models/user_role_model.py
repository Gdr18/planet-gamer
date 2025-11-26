from src.core.extensions import db


class UserRoleModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	email = db.Column(db.String(100), db.ForeignKey("user_model.email"), nullable=False)
	role = db.Column(db.Integer, nullable=False)
