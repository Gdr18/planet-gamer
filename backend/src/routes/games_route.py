from flask import Blueprint, request
from flask_jwt_extended import jwt_required, current_user

from ..core.api_responses import response_success
from ..core.enums import RoleType
from ..core.exceptions.custom_exceptions import ResourceCustomError, AuthCustomError
from ..core.extensions import db
from ..models.game_model import GameModel
from ..schemas.game_schema import GameSchema, GameFullSchema

games = Blueprint("games", __name__, url_prefix="/games")

games_schema = GameSchema(many=True)


@games.route("/", methods=["GET"])
@jwt_required()
def get_games():
	if not current_user.role in [RoleType.ADMIN.value, RoleType.STAFF.value]:
		raise AuthCustomError("forbidden")
	all_games = GameModel.query.all()
	return games_schema.dump(all_games), 200


@games.route("/", methods=["POST"])
@jwt_required()
def add_game():
	if not current_user.role in [RoleType.ADMIN.value, RoleType.STAFF.value]:
		raise AuthCustomError("forbidden")
	game_data = request.get_json()
	game_schema = GameSchema(load_instance=True)
	
	new_game = game_schema.load(game_data)
	db.session.add(new_game)
	db.session.commit()
	
	return game_schema.dump(new_game), 201


@games.route("/<game_id>", methods=["GET"])
def get_game(game_id):
	game = GameModel.query.get(game_id)
	if not game:
		raise ResourceCustomError("not_found", "videojuego")
	game_schema = GameSchema()
	return game_schema.dump(game), 200


@games.route("/<game_id>", methods=["PUT", "DELETE"])
@jwt_required()
def handle_game(game_id):
	if not current_user.role in [RoleType.ADMIN.value, RoleType.STAFF.value]:
		raise AuthCustomError("forbidden")
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
		return game_schema.dump(game), 200
	
	db.session.delete(game)
	db.session.commit()
	
	return response_success("El videojuego", "eliminado")


@games.route("/<game_id>/with-relations", methods=["GET"])
@jwt_required()
def get_items_order_by_game(game_id):
	if not current_user.role in [RoleType.ADMIN.value, RoleType.STAFF.value]:
		raise AuthCustomError("forbidden")
	game = GameModel.query.options(db.joinedload(GameModel.items_order)).get(game_id)
	if not game:
		raise ResourceCustomError("not_found", "videojuego")
	
	game_schema = GameFullSchema()
	return game_schema.dump(game), 200


@games.route("/platforms/<platform>", methods=["GET"])
def get_platform_games(platform):
	platforms = {
		"switch": "Nintendo Switch",
		"ps4": "PlayStation 4",
		"ps5": "PlayStation 5",
		"xbox": "Xbox S/X",
	}
	if not platform in platforms.keys():
		raise ResourceCustomError("not_found", "plataforma")
	all_platform_games = GameModel.query.filter_by(platform=platforms[platform]).all()
	return games_schema.dump(all_platform_games), 200
