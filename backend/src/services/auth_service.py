from flask import jsonify, Response
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    decode_token,
    JWTManager,
)

from ..models.user_model import UserModel

jwt = JWTManager()


def get_access_token(user_id: int, user_role: int) -> str:
    payload = {"identity": user_id, "additional_claims": {"role": user_role}}
    access_token = create_access_token(**payload)
    return access_token


def get_refresh_token(user_id: int) -> str:
    refresh_token = create_refresh_token(identity=user_id)
    return refresh_token


@jwt.token_in_blocklist_loader
def callback_check_revoked(header: dict, payload: dict) -> bool:
    from .redis_service import exists_revoked_token

    return exists_revoked_token(payload["jti"])


@jwt.user_identity_loader
def callback_parse_id(identity: int) -> str:
    return str(identity)


@jwt.user_lookup_loader
def callback_query_user(header: dict, payload: dict):
    user = UserModel.query.get(int(payload["sub"]))
    return user


@jwt.revoked_token_loader
def callback_revoked_token(jwt_header: dict, jwt_payload: dict) -> Response:
    return jsonify(err="revoked_token", msg="El token ha sido revocado."), 401


@jwt.invalid_token_loader
def callback_invalid_token(msg: str) -> Response:
    return jsonify(err="not_auth", msg=f"El token no es válido: {msg}"), 401


@jwt.unauthorized_loader
def callback_no_token(msg: str) -> Response:
    return jsonify(err="not_token", msg=f"No se encontró token: {msg}")
