from flask import Blueprint, request, jsonify
from marshmallow import fields

from ..utils.instantiations import db
from ..models.game_model import GameModel
from ..schemas.game_schema import GameSchema

games = Blueprint("games", __name__, url_prefix="/games")

games_schema = GameSchema(many=True)


@games.route("/", methods=["GET"])
def get_games():
    all_games = GameModel.query.all()
    return games_schema.jsonify(all_games), 200


@games.route("/", methods=["POST"])
def add_game():
    game_data = request.get_json()
    game_schema = GameSchema(load_instance=True)

    new_game = game_schema.load(game_data)

    db.session.add(new_game)
    db.session.commit()

    game = GameModel.query.get(new_game.id)

    return game_schema.jsonify(game), 201


@games.route("/<game_id>", methods=["GET", "PUT", "DELETE"])
def handle_game(game_id):
    game = GameModel.query.get(game_id)
    game_schema = GameSchema()

    if request.method == "PUT":
        data_game = request.get_json()

        game_schema.load(data_game)

        for key, value in data_game.items():
            setattr(game, key, value)

        db.session.commit()
        return game_schema.jsonify(game), 200

    if request.method == "DELETE":
        db.session.delete(game)
        db.session.commit()

        return jsonify(msg="El juego ha sido eliminado correctamente"), 200

    return game_schema.jsonify(game), 200
