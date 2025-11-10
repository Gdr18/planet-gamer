from flask import Blueprint, request, jsonify

from src.utils.instantiations import db, bcrypt
from src.models.user_model import UserModel

auth = Blueprint("auth", __name__, url_prefix="/auth")


@auth.route(
    "/login",
    methods=["POST"],
)
def login():
    data_login = request.get_json()
    email = data_login["email"]
    password = data_login["password"]

    user_exists = UserModel.query.filter_by(email=email).first()

    if user_exists:
        if not bcrypt.check_password_hash(user_exists.password, password):
            return jsonify(err="Contraseña equivocada"), 401

    # TODO: Terminar toda la lógica de auth
    pass
