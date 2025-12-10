from flask import Blueprint, request
from flask_jwt_extended import jwt_required, current_user

from src.core.api_responses import response_success
from src.core.exceptions.custom_exceptions import ResourceCustomError, AuthCustomError
from src.core.extensions import db
from ..models.user_model import UserModel
from ..schemas.user_schema import UserSchema, UserFullSchema
from ..services.bcrypt_service import hash_password, check_password

users = Blueprint("users", __name__, url_prefix="/users")


@users.route("/", methods=["GET"])
@jwt_required()
def get_users():
	if current_user.role != 1:
		raise AuthCustomError("forbidden")
	all_users = UserModel.query.all()
	users_schema = UserSchema(many=True)
	return users_schema.dump(all_users)


@users.route("/", methods=["POST"])
@jwt_required()
def add_user():
	if current_user.role != 1:
		raise AuthCustomError("forbidden")
	user_data = request.get_json()
	
	context = {
		"expected_password": user_data.get("password"),
	}
	user_schema = UserSchema(load_instance=True, context=context)
	
	new_user = user_schema.load(user_data)
	
	new_user.password = hash_password(user_data["password"])
	
	db.session.add(new_user)
	db.session.commit()
	
	return user_schema.dump(new_user)


@users.route("/<user_id>", methods=["GET", "DELETE", "PUT"])
@jwt_required()
def handle_user(user_id):
	if current_user.role != 1 and current_user.id != int(user_id):
		raise AuthCustomError("forbidden")
	user = UserModel.query.get(user_id)
	if not user:
		raise ResourceCustomError("not_found", "usuario")
	user_schema = UserSchema()
	
	if request.method == "PUT":
		user_data = request.get_json()
		
		context = {
			"expected_password": user_data.get("password"),
		}
		user_schema.context = context
		validated_user = user_schema.load(user_data)
		
		for key, value in validated_user.items():
			if key == "password":
				if user.password != value and not check_password(user.password, value):
					setattr(user, key, hash_password(value))
					continue
			setattr(user, key, value)
		
		db.session.commit()
		return user_schema.dump(user)
	
	elif request.method == "DELETE":
		db.session.delete(user)
		db.session.commit()
		return response_success("el usuario", "eliminado")
	
	return user_schema.dump(user)


@users.route("/<user_id>/with-relations", methods=["GET"])
@jwt_required()
def get_user_relationships(user_id):
	if current_user.role != 1 and current_user.id != int(user_id):
		raise AuthCustomError("forbidden")
	user = UserModel.query.options(
		db.selectinload(UserModel.basket),
		db.selectinload(UserModel.addresses),
		db.selectinload(UserModel.orders)
	).get(user_id)
	if not user:
		raise ResourceCustomError("not_found", "usuario")
	
	user_schema = UserFullSchema()
	return user_schema.dump(user), 200
