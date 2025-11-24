from flask import request, Blueprint

from src.core.exceptions.custom_exceptions import ResourceCustomError
from src.core.responses.api_responses import response_success
from src.extensions import db
from ..models.item_order_model import ItemOrderModel
from ..schemas.item_order_schema import ItemOrderSchema

items_order_schema = ItemOrderSchema(many=True)

items_order = Blueprint("items_order", __name__, url_prefix="/items-order")


@items_order.route("/", methods=["POST"])
def add_item_order():
	item_order_data = request.get_json()
	
	item_order_schema = ItemOrderSchema(load_instance=True)
	
	new_item_order = item_order_schema.load(item_order_data)
	
	db.session.add(new_item_order)
	db.session.commit()
	
	return item_order_schema.jsonify(new_item_order), 201


@items_order.route("/", methods=["GET"])
def get_item_order():
	all_items_order = ItemOrderModel.query.all()
	return items_order_schema.jsonify(all_items_order), 200


@items_order.route("/<item_order_id>", methods=["GET", "PUT", "DELETE"])
def handle_item_order(item_order_id):
	item_order = ItemOrderModel.query.get(item_order_id)
	if not item_order:
		raise ResourceCustomError("not_found", "item del pedido")
	item_order_schema = ItemOrderSchema()
	
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
	
	return item_order_schema.jsonify(item_order), 200


@items_order.route("/orders/<order_id>", methods=["GET"])
def get_all_items_order(order_id):
	all_items_order = ItemOrderModel.query.filter_by(
		details_order_id=order_id
	).all()
	return items_order_schema.jsonify(all_items_order), 200
