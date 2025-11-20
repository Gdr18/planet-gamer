from flask import Blueprint, request, jsonify

from src.services.db_service import db, bcrypt
from ..exceptions.custom_exceptions import ValueCustomError
from ..models.user_model import UserModel
from ..schemas.user_schema import UserSchema

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
	
	new_user.password = bcrypt.generate_password_hash(user_data["password"]).decode(
		"utf-8"
	)
	
	db.session.add(new_user)
	db.session.commit()
	
	return user_schema.jsonify(new_user)


@users.route("/<user_id>", methods=["GET", "DELETE", "PUT"])
def handle_user(user_id):
	user = UserModel.query.get(user_id)
	if not user:
		raise ValueCustomError("not_found", "usuario")
	user_schema = UserSchema()
	
	if request.method == "PUT":
		user_data = request.get_json()
		
		context = {
			"expected_password": user_data.get("password"),
		}
		user_schema.context = context
		user_instance = user_schema.load(user_data)
		
		for key, value in user_instance.items():
			if key == "password":
				if not bcrypt.check_password_hash(user_instance.password, value) and (
					user_instance.password != value
				):
					user_instance.password = bcrypt.generate_password_hash(value).decode("utf-8")
			setattr(user, key, value)
		
		db.session.commit()
		return user_schema.jsonify(user)
	
	elif request.method == "DELETE":
		db.session.delete(user)
		db.session.commit()
		return jsonify(msg="Usuario eliminado correctamente"), 200
	
	return user_schema.jsonify(user)
