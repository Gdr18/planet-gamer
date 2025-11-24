from src.extensions import db
from ..models.order_model import OrderModel


class AddressModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	street = db.Column(db.String(100), nullable=False)
	second_line_street = db.Column(db.String(50), nullable=True, default=None)
	postal_code = db.Column(db.String(5), nullable=False)
	city = db.Column(db.String(40), nullable=False)
	user_id = db.Column(db.Integer, db.ForeignKey("user_model.id"), nullable=False)
	default = db.Column(db.Boolean, nullable=True, default=False)
	orders = db.relationship(OrderModel, backref="address", lazy="noload")


def unset_previous_default(model_instance: AddressModel) -> None:
	existing_default = AddressModel.query.filter_by(
		user_id=model_instance.user_id, default=True
	).first()
	if existing_default and existing_default != model_instance:
		existing_default.default = False
		db.session.add(existing_default)
