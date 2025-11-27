from flask import Blueprint, request
from flask_jwt_extended import jwt_required, current_user

from ..core.api_responses import response_success
from ..core.enums import RoleType
from ..core.exceptions.custom_exceptions import ResourceCustomError, AuthCustomError
from ..core.extensions import db
from ..models.basket_item_model import ItemBasketModel
from ..schemas.basket_item_schema import BasketItemSchema

items_basket = Blueprint("items_basket", __name__, url_prefix="/items-basket")

baskets_schema = BasketItemSchema(many=True)


@items_basket.route("/", methods=["GET"])
@jwt_required()
def get_items_basket():
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	all_items_basket = ItemBasketModel.query.all()
	return baskets_schema.jsonify(all_items_basket), 200


@items_basket.route("/", methods=["POST"])
@jwt_required()
def add_item_basket():
	item_basket_data = request.get_json()
	
	item_basket_schema = BasketItemSchema(load_instance=True)
	new_item_basket = item_basket_schema.load(item_basket_data)
	
	if new_item_basket.user_id != current_user.id and current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden_action", "Añadir un elemento a la cesta de otro usuario")
	
	db.session.add(new_item_basket)
	db.session.commit()
	
	return item_basket_schema.jsonify(new_item_basket), 201


@items_basket.route("/<item_basket_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_item_basket(item_basket_id):
	item_basket = ItemBasketModel.query.get(item_basket_id)
	if not item_basket:
		raise ResourceCustomError("not_found", "elemento de la cesta")
	if current_user.id != item_basket.user_id and current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden_action", "Acceder a un elemento de la cesta de otro usuario")
	item_basket_schema = BasketItemSchema()
	
	if request.method == "PUT":
		item_basket_data = request.get_json()
		
		context = {
			"expected_game_id": item_basket.game_id,
			"expected_user_id": item_basket.user_id,
		}
		item_basket_schema.context = context
		
		item_basket_update = item_basket_schema.load(item_basket_data)
		
		for key, value in item_basket_update.items():
			setattr(item_basket, key, value)
		
		db.session.commit()
	
	if request.method == "DELETE":
		db.session.delete(item_basket)
		db.session.commit()
		return response_success("el elemento de la cesta", "eliminado")
	
	return item_basket_schema.jsonify(item_basket), 200


@items_basket.route("/users/<user_id>", methods=["GET"])
@jwt_required()
def get_basket_user_id(user_id):
	if current_user.role != RoleType.ADMIN.value and current_user.id != int(user_id):
		raise AuthCustomError("forbidden_action", "Acceder a la cesta de otro usuario")
	user_basket = ItemBasketModel.query.filter_by(user_id=user_id).all()
	return baskets_schema.jsonify(user_basket)
