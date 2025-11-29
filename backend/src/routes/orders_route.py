from flask import request, Blueprint, jsonify
from flask_jwt_extended import jwt_required, current_user

from ..core.api_responses import response_success
from ..core.enums import RoleType
from ..core.exceptions.custom_exceptions import ResourceCustomError, AuthCustomError
from ..core.extensions import db
from ..models.order_model import OrderModel
from ..schemas.order_item_schema import OrderItemSchema
from ..schemas.order_schema import OrderSchema

orders = Blueprint("orders", __name__, url_prefix="/orders")

orders_schema = OrderSchema(many=True)


@orders.route("/", methods=["GET"])
@jwt_required()
def get_orders():
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	all_orders = OrderModel.query.all()
	return orders_schema.jsonify(all_orders)


@orders.route("/", methods=["POST"])
@jwt_required()
def add_order():
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	order_data = request.get_json()
	
	order_schema = OrderSchema(load_instance=True)
	
	new_order = order_schema.load(order_data)
	
	db.session.add(new_order)
	db.session.commit()
	
	return order_schema.jsonify(new_order), 201


@orders.route("/<order_id>", methods=["GET"])
@jwt_required()
def get_order(order_id):
	order = OrderModel.query.get(order_id)
	if not order:
		raise ResourceCustomError("not_found", "pedido")
	if current_user.role != RoleType.ADMIN.value and current_user.id != order.user_id:
		raise AuthCustomError("forbidden_action", "ver este pedido")
	
	order_schema = OrderSchema()
	return order_schema.jsonify(order), 200


@orders.route("/<order_id>", methods=["PUT", "DELETE"])
@jwt_required()
def handle_order(order_id):
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	
	order = OrderModel.query.get(order_id)
	if not order:
		raise ResourceCustomError("not_found", "pedido")
	
	order_schema = OrderSchema()
	
	if request.method == "PUT":
		order_data = request.get_json()
		
		context = {"expected_user_id": order.user_id}
		order_schema.context = context
		order_updated = order_schema.load(order_data)
		
		for key, value in order_updated.items():
			setattr(order, key, value)
		
		db.session.commit()
		return order_schema.jsonify(order)
	
	db.session.delete(order)
	db.session.commit()
	
	return response_success("el pedido", "eliminado")


@orders.route("/users/<user_id>", methods=["GET"])
@jwt_required()
def get_orders_user(user_id):
	if current_user.id != int(user_id) and current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden_action", "ver los pedidos de otro usuario")
	user_orders = OrderModel.query.filter_by(user_id=user_id).all()
	return orders_schema.dump(user_orders), 200


@orders.route("/with-items", methods=["POST"])
@jwt_required()
def add_order_with_items():
	data = request.get_json()
	order_data = data.get("order")
	items_data = data.get("items")
	
	order_item_schema = OrderItemSchema(load_instance=True)
	order_schema = OrderSchema(load_instance=True)
	
	new_order = order_schema.load(order_data)
	
	if current_user.role != RoleType.ADMIN.value and new_order.user_id != current_user.id:
		raise AuthCustomError("forbidden_action", "crear un pedido para otro usuario")
	
	try:
		db.session.add(new_order)
		db.session.flush()
		
		for item in items_data:
			item["orderId"] = new_order.id
			new_item = order_item_schema.load(item)
			db.session.add(new_item)
		
		db.session.commit()
		
		result = {
			"order": order_schema.dump(new_order),
			"items": order_item_schema.dump(new_order.items, many=True),
		}
		
		return jsonify(result), 201
	except Exception as e:
		db.session.rollback()
		raise e
