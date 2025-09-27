from flask import Blueprint, request

from ..utils.instantiations import ma, db
from ..models.basket_model import Basket
from ..models.game_model import Game
from ..routes.game_route import games_schema

basket = Blueprint("basket", __name__)


class BasketSchema(ma.Schema):
    class Meta:
        fields = ("id", "qty", "basket_game_id", "basket_user_id")


basket_schema = BasketSchema()
baskets_schema = BasketSchema(many=True)


@basket.route(
    "/basket",
    methods=["GET", "POST", "PUT", "DELETE"],
)
def select_item_basket():
    qty = request.json["qty"]
    basket_game_id = request.json["basket_game_id"]
    basket_user_id = request.json["basket_user_id"]
    if request.method == "GET":
        basket = (
            db.session.query(Basket)
            .filter(
                Basket.basket_user_id == basket_user_id,
                Basket.basket_game_id == basket_game_id,
            )
            .first()
        )
        return basket_schema.jsonify(basket)
    if request.method == "POST":

        new_basket = Basket(qty, basket_game_id, basket_user_id)

        db.session.add(new_basket)
        db.session.commit()

        basket = Basket.query.get(new_basket.id)

        return basket_schema.jsonify(basket)

    if request.method == "PUT":
        basket = (
            db.session.query(Basket)
            .filter(
                Basket.basket_user_id == basket_user_id,
                Basket.basket_game_id == basket_game_id,
            )
            .first()
        )
        basket.qty = qty
        db.session.commit()

        return basket_schema.jsonify(basket)

    if request.method == "DELETE":
        db.session.query(Basket).filter(
            Basket.basket_user_id == basket_user_id,
            Basket.basket_game_id == basket_game_id,
        ).delete()
        db.session.commit()

        return f"The basket's game {basket_game_id} was successfully deleted."


@basket.route(
    "/baskets",
    methods=["POST", "GET", "DELETE"],
)
def select_baskets():
    if request.method == "GET":
        all_baskets = Basket.query.all()
        return baskets_schema.jsonify(all_baskets)

    if request.method == "POST":
        for basket in request.json:
            qty = basket["qty"]
            basket_game_id = basket["basket_game_id"]
            basket_user_id = basket["basket_user_id"]
            new_basket = Basket(qty, basket_game_id, basket_user_id)

            db.session.add(new_basket)
            db.session.commit()
        baskets = Basket.query.filter_by(basket_user_id=request.json[0]["basket_user_id"]).all()

        return baskets_schema.jsonify(baskets)

    if request.method == "DELETE":
        basket_user_id = request.json["basket_user_id"]
        baskets_user = Basket.query.filter_by(basket_user_id=basket_user_id).all()
        for basket in baskets_user:
            db.session.delete(basket)
            db.session.commit()
        return f"The basket items from user {basket_user_id} were successfully deleted."


@basket.route("/basket-games/<basket_user_id>", methods=["GET"])
def select_basket(basket_user_id):
    if request.method == "GET":
        games_and_baskets = (
            db.session.query(Basket, Game)
            .join(Basket)
            .filter_by(basket_user_id=basket_user_id)
            .all()
        )

        games = []

        for basket, game in games_and_baskets:
            game = Game.query.get(game.id)
            game.qty = basket.qty
            games.append(game)

        return games_schema.jsonify(games)
