from flask import Blueprint, request
from flask_jwt_extended import jwt_required, current_user

from ..core.api_responses import response_success
from ..core.enums import RoleType
from ..core.exceptions.custom_exceptions import ResourceCustomError, AuthCustomError
from ..core.extensions import db
from ..models.user_role_model import UserRoleModel
from ..schemas.user_role_schema import UserRoleSchema

user_roles = Blueprint("user_roles", __name__, url_prefix="/user-roles")

user_role_schema = UserRoleSchema()


@user_roles.route("/", methods=["GET"])
@jwt_required()
def get_user_roles():
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	all_user_roles = UserRoleModel.query.all()
	roles_schema = UserRoleSchema(many=True)
	return roles_schema.jsonify(all_user_roles), 200


@user_roles.route("/", methods=["POST"])
@jwt_required()
def add_user_role():
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	user_role_data = request.get_json()
	
	validated_data = user_role_schema.load(user_role_data)
	new_user_role = UserRoleModel(**validated_data)
	
	db.session.add(new_user_role)
	db.session.commit()
	
	return user_role_schema.jsonify(new_user_role), 201


@user_roles.route("/<user_role_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_user_role(user_role_id):
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	user_role = UserRoleModel.query.get(user_role_id)
	if not user_role:
		raise ResourceCustomError("not_found", "rol de usuario")
	
	if request.method == "PUT":
		user_role_data = request.get_json()
		
		context = {
			"expected_email": user_role.email,
		}
		user_role_schema.context = context
		user_role_update = user_role_schema.load(user_role_data)
		
		user_role.role = user_role_update["role"]
		
		db.session.commit()
		
		return user_role_schema.jsonify(user_role)
	
	if request.method == "DELETE":
		db.session.delete(user_role)
		db.session.commit()
		
		return response_success("el rol de usuario", "eliminado")
	
	return user_role_schema.jsonify(user_role)
