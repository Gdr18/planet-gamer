from flask import Blueprint, request, jsonify
from marshmallow import fields

from ..utils.instantiations import ma, db
from ..models.game_model import Game


class GameSchema(ma.Schema):
    date = fields.DateTime(format="%d-%m-%YT%H:%M:%S")

    class Meta:
        fields = (
            "id",
            "title",
            "description",
            "platform",
            "gender",
            "pegi",
            "release",
            "price",
            "img",
        )


game_schema = GameSchema()
games_schema = GameSchema(many=True)

games = Blueprint("games", __name__, url_prefix="/games")


@games.route("/", methods=["GET"])
def get_games():
    all_games = Game.query.all()
    return games_schema.jsonify(all_games), 200


@games.route("/", methods=["POST"])
def add_game():
    game_data = request.get_json()

    new_game = Game(**game_data)

    db.session.add(new_game)
    db.session.commit()

    game = Game.query.get(new_game.id)

    return game_schema.jsonify(game), 201


@games.route("/<game_id>", methods=["GET", "PUT", "DELETE"])
def handle_game(game_id):
    game = Game.query.get(game_id)
    if request.method == "PUT":
        game_new_data = request.get_json()
        game = Game.query.get(game_id)

        # TODO: No se filtran datos
        game.title = game_new_data.title
        game.description = game_new_data.description
        game.gender = game_new_data.gender
        game.platform = game_new_data.platform
        game.platform_url = game_new_data.platform_url
        game.pegi = game_new_data.pegi
        game.release = game_new_data.release
        game.price = game_new_data.price
        game.img = game_new_data.img

        db.session.commit()
        return game_schema.jsonify(game), 200

    if request.method == "DELETE":
        game = Game.query.get(game_id)
        db.session.delete(game)
        db.session.commit()

        return jsonify(msg="El juego ha sido eliminado correctamente"), 200

    return game_schema.jsonify(game), 200
