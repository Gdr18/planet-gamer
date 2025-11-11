from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, decode_token, jwt_required, current_user

from ..models.user_model import UserModel
from ..schemas.user_schema import UserSchema
from ..services.auth_service import get_access_token, get_refresh_token
from ..services.db_service import bcrypt, db
from ..services.redis_service import (
    set_refresh_token,
    set_revoked_token,
    exists_refresh_token,
)

auth = Blueprint("auth", __name__, url_prefix="/auth")


@auth.route(
    "/register",
    methods=["POST"],
)
def registration():
    registration_data = request.get_json()

    context = {"expected_password": registration_data.get("password")}
    user_schema = UserSchema(load_instance=True, context=context)
    user_object = user_schema.load(registration_data)
    user_object.password = bcrypt.generate_password_hash(user_object.password)

    db.session.add(user_object)
    db.session.commit()

    return jsonify(msg="Usuario añadido correctamente"), 201


@auth.route("/login", methods=["POST"])
def login():
    login_data = request.get_json()

    user = UserModel.query.filter_by(email=login_data.get("email")).first()
    if not user:
        return jsonify(err="not_found", msg="Usuario no encontrado"), 404

    if not bcrypt.check_password_hash(user.password, login_data.get("password")):
        return jsonify(err="not_auth", msg="Contraseña incorrecta"), 401

    token = get_access_token(user.id, user.role)
    refresh_token = get_refresh_token(user.id)

    decode_refresh = decode_token(refresh_token)
    set_refresh_token(decode_refresh)

    return (
        jsonify(
            msg="Inicio de sesión correcto",
            access_token=token,
            refresh_token=refresh_token,
        ),
        200,
    )


@auth.route("/refresh-token", methods=["GET"])
@jwt_required(refresh=True)
def login_with_refresh():
    jti = get_jwt()["jti"]
    if not exists_refresh_token(jti):
        return jsonify(err="not_auth", msg="Token de refresco no válido"), 401

    access_token = get_access_token(current_user.id, current_user.role)
    return (
        jsonify(
            msg="Token de acceso renovado correctamente",
            access_token=access_token,
        ),
        200,
    )


@auth.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    token_info = get_jwt()
    set_revoked_token(token_info)
    return jsonify(msg="Cierre de sesión correcto"), 200
