from flask import Blueprint, request

from src.core.exceptions.custom_exceptions import ResourceCustomError
from src.core.responses.api_responses import response_success
from src.extensions import db
from ..models.user_model import UserModel
from ..schemas.user_schema import UserSchema
from ..services.bcrypt_service import hash_password, check_password

users = Blueprint("users", __name__, url_prefix="/users")

users_schema = UserSchema(many=True)


@users.route("/", methods=["GET"])
def get_users():
	all_users = UserModel.query.all()
	return users_schema.jsonify(all_users)


@users.route("/", methods=["POST"])
def add_user():
	user_data = request.get_json()
	
	context = {
		"expected_password": user_data.get("password"),
	}
	user_schema = UserSchema(load_instance=True, context=context)
	
	new_user = user_schema.load(user_data)
	
	new_user.password = hash_password(user_data["password"])
	
	db.session.add(new_user)
	db.session.commit()
	
	return user_schema.jsonify(new_user)


@users.route("/<user_id>", methods=["GET", "DELETE", "PUT"])
def handle_user(user_id):
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
		return user_schema.jsonify(user)
	
	elif request.method == "DELETE":
		db.session.delete(user)
		db.session.commit()
		return response_success("el usuario", "eliminado")
	
	return user_schema.jsonify(user)
