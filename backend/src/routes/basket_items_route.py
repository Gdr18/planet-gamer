from flask import Blueprint, request
from flask_jwt_extended import jwt_required, current_user

from ..core.api_responses import response_success
from ..core.enums import RoleType
from ..core.exceptions.custom_exceptions import ResourceCustomError, AuthCustomError
from ..core.extensions import db
from ..models.basket_item_model import BasketItemModel
from ..schemas.basket_item_schema import BasketItemSchema

basket_items = Blueprint("items_basket", __name__, url_prefix="/basket-items")

basket_items_schema = BasketItemSchema(many=True)


@basket_items.route("/", methods=["GET"])
@jwt_required()
def get_items_basket():
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	all_basket_items = BasketItemModel.query.all()
	return basket_items_schema.dump(all_basket_items), 200


@basket_items.route("/", methods=["POST"])
@jwt_required()
def add_item_basket():
	basket_item_data = request.get_json()
	
	basket_item_schema = BasketItemSchema(load_instance=True)
	new_basket_item = basket_item_schema.load(basket_item_data)
	
	if new_basket_item.user_id != current_user.id and current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden_action", "Añadir un elemento a la cesta de otro usuario")
	
	db.session.add(new_basket_item)
	db.session.commit()
	
	return basket_item_schema.dump(new_basket_item), 201


@basket_items.route("/<basket_item_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_item_basket(basket_item_id):
	basket_item = BasketItemModel.query.get(basket_item_id)
	if not basket_item:
		raise ResourceCustomError("not_found", "elemento de la cesta")
	if current_user.id != basket_item.user_id and current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden_action", "Acceder a un elemento de la cesta de otro usuario")
	basket_item_schema = BasketItemSchema()
	
	if request.method == "PUT":
		basket_item_data = request.get_json()
		
		context = {
			"expected_game_id": basket_item.game_id,
			"expected_user_id": basket_item.user_id,
		}
		basket_item_schema.context = context
		
		basket_item_updated = basket_item_schema.load(basket_item_data)
		
		for key, value in basket_item_updated.items():
			setattr(basket_item, key, value)
		
		db.session.commit()
	
	if request.method == "DELETE":
		db.session.delete(basket_item)
		db.session.commit()
		return response_success("el elemento de la cesta", "eliminado")
	
	return basket_item_schema.dump(basket_item), 200


@basket_items.route("/users/<user_id>", methods=["GET"])
@jwt_required()
def get_basket_user_id(user_id):
	if current_user.role != RoleType.ADMIN.value and current_user.id != int(user_id):
		raise AuthCustomError("forbidden_action", "Acceder a la cesta de otro usuario")
	user_basket = BasketItemModel.query.filter_by(user_id=user_id).all()
	return basket_items_schema.dump(user_basket)
