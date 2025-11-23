from flask import Blueprint, jsonify

main = Blueprint("main", __name__)


@main.route("/", methods=["GET"])
def welcome():
	return jsonify(msg="Bienvenidx a la API REST de Planet Gamer!"), 200
