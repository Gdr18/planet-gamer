from flask_jwt_extended import (
	create_access_token,
	create_refresh_token,
	JWTManager,
)

from src.core.exceptions.custom_exceptions import AuthCustomError
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
def callback_revoked_token(jwt_header: dict, jwt_payload: dict) -> tuple:
	return AuthCustomError("revoked_token").json_response()


@jwt.invalid_token_loader
def callback_invalid_token(msg: str) -> tuple:
	return AuthCustomError("invalid_token", msg).json_response()


@jwt.unauthorized_loader
def callback_no_token(msg: str) -> tuple:
	return AuthCustomError("not_token", msg).json_response()


@jwt.expired_token_loader
def callback_expired_token(jwt_header: dict, jwt_payload: dict) -> tuple:
	return AuthCustomError("expired_token").json_response()
