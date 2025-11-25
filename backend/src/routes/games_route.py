from flask import Blueprint, request

from src.core.exceptions.custom_exceptions import ResourceCustomError
from src.core.responses.api_responses import response_success
from src.extensions import db
from ..models.game_model import GameModel
from ..schemas.game_schema import GameSchema, GameFullSchema

games = Blueprint("games", __name__, url_prefix="/games")

games_schema = GameSchema(many=True)


@games.route("/", methods=["GET"])
def get_games():
	all_games = GameModel.query.all()
	return games_schema.jsonify(all_games), 200


@games.route("/", methods=["POST"])
def add_game():
	game_data = request.get_json()
	game_schema_post = GameSchema(load_instance=True)
	
	new_game = game_schema_post.load(game_data)
	
	db.session.add(new_game)
	db.session.commit()
	
	return game_schema_post.jsonify(new_game), 201


@games.route("/<game_id>", methods=["GET", "PUT", "DELETE"])
def handle_game(game_id):
	game = GameModel.query.get(game_id)
	if not game:
		raise ResourceCustomError("not_found", "videojuego")
	game_schema = GameSchema()
	
	if request.method == "PUT":
		data_game = request.get_json()
		
		game_update = game_schema.load(data_game)
		
		for key, value in game_update.items():
			setattr(game, key, value)
		
		db.session.commit()
		return game_schema.jsonify(game), 200
	
	if request.method == "DELETE":
		db.session.delete(game)
		db.session.commit()
		
		return response_success("El videojuego", "eliminado")
	
	return game_schema.jsonify(game), 200


@games.route("/<game_id>/with-relations", methods=["GET"])
def get_items_order_by_game(game_id):
	game = GameModel.query.options(db.joinedload(GameModel.items_order)).get(game_id)
	if not game:
		raise ResourceCustomError("not_found", "videojuego")
	
	game_schema = GameFullSchema()
	return game_schema.jsonify(game), 200


@games.route("/platforms/<platform>", methods=["GET"])
def get_game_platform(platform):
	platforms = {
		"switch": "Nintendo Switch",
		"ps4": "PlayStation 4",
		"ps5": "PlayStation 5",
		"xbox": "Xbox S/X",
	}
	all_platform_games = GameModel.query.filter_by(platform=platforms[platform]).all()
	return games_schema.jsonify(all_platform_games), 200
