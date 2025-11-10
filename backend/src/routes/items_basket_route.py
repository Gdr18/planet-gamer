from flask import Blueprint, request, jsonify

from ..utils.instantiations import ma, db
from ..models.item_basket_model import ItemBasketModel

items_basket = Blueprint("items_basket", __name__, url_prefix="/items-basket")


class BasketSchema(ma.Schema):
    class Meta:
        fields = ("id", "qty", "basket_game_id", "basket_user_id")


basket_schema = BasketSchema()
baskets_schema = BasketSchema(many=True)


@items_basket.route("/", methods=["GET"])
def get_item_basket():
    all_items_basket = ItemBasketModel.query.all()
    return baskets_schema.jsonify(all_items_basket)


@items_basket.route("/", methods=["POST"])
def add_item_basket():
    basket_data = request.get_json()

    new_basket = ItemBasketModel(**basket_data)

    db.session.add(new_basket)
    db.session.commit()

    return baskets_schema.jsonify(items_basket)


@items_basket.route("/<item_basket_id>", methods=["GET", "PUT", "DELETE"])
def handle_item_basket(item_basket_id):
    item_basket = ItemBasketModel.query.get(item_basket_id)
    if request.method == "PUT":
        basket_data = request.get_json()
        for key, value in basket_data.items():
            setattr(item_basket, key, value)
        db.session.commit()

    if request.method == "DELETE":
        db.session.delete(item_basket)
        db.session.commit()
        return jsonify(msg="La cesta ha sido eliminada correctamente."), 200

    return basket_schema.jsonify(item_basket), 200


@items_basket.route("/users/<user_id>", methods=["GET"])
def get_basket_user_id(user_id):
    # TODO: Cómo se hace un join para añadir info de juegos?
    user_basket = ItemBasketModel.query.filter_by(basket_user_id=user_id).all()
    return baskets_schema.jsonify(user_basket)
