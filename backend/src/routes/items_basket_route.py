from flask import Blueprint, request, jsonify

from src.services.db_service import db
from ..exceptions.custom_exceptions import ValueCustomError
from ..models.item_basket_model import ItemBasketModel
from ..schemas.item_basket_schema import ItemBasketSchema

items_basket = Blueprint("items_basket", __name__, url_prefix="/items-basket")

baskets_schema = ItemBasketSchema(many=True)


@items_basket.route("/", methods=["GET"])
def get_items_basket():
	all_items_basket = ItemBasketModel.query.all()
	return baskets_schema.jsonify(all_items_basket), 200


@items_basket.route("/", methods=["POST"])
def add_item_basket():
	item_basket_data = request.get_json()
	
	item_basket_schema = ItemBasketSchema(load_instance=True)
	
	new_item_basket = item_basket_schema.load(item_basket_data)
	
	db.session.add(new_item_basket)
	db.session.commit()
	
	return item_basket_schema.jsonify(new_item_basket), 201


@items_basket.route("/<item_basket_id>", methods=["GET", "PUT", "DELETE"])
def handle_item_basket(item_basket_id):
	item_basket = ItemBasketModel.query.get(item_basket_id)
	if not item_basket:
		raise ValueCustomError("not_found", "elemento de la cesta")
	item_basket_schema = ItemBasketSchema()
	
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
		return (
			jsonify(msg="El elemento de la cesta ha sido eliminado correctamente."),
			200,
		)
	
	return item_basket_schema.jsonify(item_basket), 200


@items_basket.route("/users/<user_id>", methods=["GET"])
def get_basket_user_id(user_id):
	# TODO: Cómo se hace un join para añadir info de juegos? - backref game
	user_basket = ItemBasketModel.query.filter_by(user_id=user_id).all()
	return baskets_schema.jsonify(user_basket)
