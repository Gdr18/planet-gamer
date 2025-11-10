from flask import Blueprint, request, jsonify

from ..utils.instantiations import db
from ..models.item_basket_model import ItemBasketModel
from ..schemas.item_basket_schema import ItemBasketSchema

items_basket = Blueprint("items_basket", __name__, url_prefix="/items-basket")

baskets_schema = ItemBasketSchema(many=True)


@items_basket.route("/", methods=["GET"])
def get_items_basket():
    all_items_basket = ItemBasketModel.query.all()
    return baskets_schema.jsonify(all_items_basket)


@items_basket.route("/", methods=["POST"])
def add_item_basket():
    basket_data = request.get_json()

    basket_schema = ItemBasketSchema(load_instance=True)

    new_basket = basket_schema.load(basket_data)

    db.session.add(new_basket)
    db.session.commit()

    return basket_schema.jsonify(new_basket)


@items_basket.route("/<item_basket_id>", methods=["GET", "PUT", "DELETE"])
def handle_item_basket(item_basket_id):
    item_basket = ItemBasketModel.query.get(item_basket_id)
    basket_schema = ItemBasketSchema()

    if request.method == "PUT":
        basket_data = request.get_json()

        context = {
            "mode": "update",
            "expected_game_id": item_basket.game_id,
            "expected_user_id": item_basket.user_id,
        }
        basket_schema.context = context

        basket_schema.load(basket_data)

        for key, value in basket_data.items():
            setattr(item_basket, key, value)

        db.session.commit()

    if request.method == "DELETE":
        db.session.delete(item_basket)
        db.session.commit()
        return (
            jsonify(msg="El elemento de la cesta ha sido eliminado correctamente."),
            200,
        )

    return basket_schema.jsonify(item_basket), 200


@items_basket.route("/users/<user_id>", methods=["GET"])
def get_basket_user_id(user_id):
    # TODO: Cómo se hace un join para añadir info de juegos?
    user_basket = ItemBasketModel.query.filter_by(basket_user_id=user_id).all()
    return baskets_schema.jsonify(user_basket)
