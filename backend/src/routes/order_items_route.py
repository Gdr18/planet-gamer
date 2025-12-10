from flask import request, Blueprint
from flask_jwt_extended import jwt_required, current_user

from ..core.api_responses import response_success
from ..core.enums import RoleType
from ..core.exceptions.custom_exceptions import ResourceCustomError, AuthCustomError
from ..core.extensions import db
from ..models.order_item_model import OrderItemModel
from ..schemas.order_item_schema import OrderItemSchema

items_order_schema = OrderItemSchema(many=True)

items_order = Blueprint("items_order", __name__, url_prefix="/items-order")


@items_order.route("/", methods=["POST"])
@jwt_required()
def add_item_order():
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden_action", "agregar item del pedido para otro usuario")
	
	item_order_data = request.get_json()
	
	item_order_schema = OrderItemSchema(load_instance=True)
	new_item_order = item_order_schema.load(item_order_data)
	
	db.session.add(new_item_order)
	db.session.commit()
	
	return item_order_schema.dump(new_item_order), 201


@items_order.route("/", methods=["GET"])
@jwt_required()
def get_item_order():
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	
	all_items_order = OrderItemModel.query.all()
	return items_order_schema.dump(all_items_order), 200


@items_order.route("/<item_order_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_item_order(item_order_id):
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	
	item_order = OrderItemModel.query.get(item_order_id)
	if not item_order:
		raise ResourceCustomError("not_found", "item del pedido")
	
	item_order_schema = OrderItemSchema()
	
	if request.method == "PUT":
		item_order_data = request.get_json()
		
		context = {
			"expected_game_id": item_order.game_id,
			"expected_order_id": item_order.order_id,
		}
		item_order_schema.context = context
		
		item_order_update = item_order_schema.load(item_order_data)
		
		for key, value in item_order_update.items():
			setattr(item_order, key, value)
		
		db.session.commit()
	
	if request.method == "DELETE":
		db.session.delete(item_order)
		db.session.commit()
		return response_success("el item del pedido", "eliminado")
	
	return item_order_schema.dump(item_order), 200


@items_order.route("/orders/<order_id>", methods=["GET"])
@jwt_required()
def get_all_items_order(order_id):
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	all_items_order = OrderItemModel.query.filter_by(
		details_order_id=order_id
	).all()
	return items_order_schema.dump(all_items_order), 200
