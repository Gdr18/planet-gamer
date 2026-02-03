from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, decode_token, jwt_required, current_user

from src.core.api_responses import response_success, msg_success
from src.core.extensions import db
from ..core.exceptions.custom_exceptions import ResourceCustomError, AuthCustomError
from ..models.user_model import UserModel
from ..schemas.user_schema import UserSchema, UserBasketSchema
from ..services.auth_service import get_access_token, get_refresh_token
from ..services.bcrypt_service import hash_password, check_password
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
	new_user = user_schema.load(registration_data)
	new_user.password = hash_password(new_user.password)
	
	db.session.add(new_user)
	db.session.commit()
	
	return response_success("el usuario", "registrado", 201)


@auth.route("/login", methods=["POST"])
def login():
	login_data = request.get_json()
	
	user = UserModel.query.options(db.selectinload(UserModel.basket)).filter_by(email=login_data.get("email")).first()
	if not user:
		raise ResourceCustomError("not_found", "usuario")
	
	if not login_data.get("password"):
		raise AuthCustomError("password_required")
	
	if not check_password(user.password, login_data.get("password")):
		raise AuthCustomError("password_mismatch")
	
	token = get_access_token(user.id, user.role)
	refresh_token = get_refresh_token(user.id)
	
	decode_refresh = decode_token(refresh_token)
	set_refresh_token(decode_refresh)
	return (
		jsonify(
			user=UserBasketSchema().dump(user),
			msg=msg_success("el usuario", "autenticado"),
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
		raise AuthCustomError("expired_token")
	
	user = UserModel.query.options(db.selectinload(UserModel.basket)).filter_by(id=current_user.id).first()
	if not user:
		raise ResourceCustomError("not_found", "usuario")
	access_token = get_access_token(current_user.id, current_user.role)
	return (
		jsonify(
			user=UserBasketSchema().dump(user),
			msg=msg_success("el token de acceso", "renovado"),
			access_token=access_token,
		),
		200,
	)


@auth.route("/logout", methods=["POST"])
@jwt_required()
def logout():
	token_info = get_jwt()
	set_revoked_token(token_info)
	return response_success("la sesión", "cerrada")
