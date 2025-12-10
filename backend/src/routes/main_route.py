from flask import Blueprint, jsonify

from ..services.redis_service import stay_alive_redis

main = Blueprint("main", __name__)


@main.route("/", methods=["GET"])
def welcome():
	return jsonify(msg="Bienvenidx a la API REST de Planet Gamer!"), 200


@main.route("/health-redis", methods=["GET"])
def health_redis():
	if stay_alive_redis():
		return jsonify(msg="Redis está funcionando correctamente."), 200
	else:
		return jsonify(msg="Error al conectar con Redis."), 500
