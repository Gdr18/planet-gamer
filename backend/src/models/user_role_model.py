from src.services.db_service import db


class UserRoleModel(db.Model):
	email = db.Column(db.String(100), db.ForeignKey("user_model.email"), primary_key=True, nullable=False)
	role = db.Column(db.Integer, nullable=False)
