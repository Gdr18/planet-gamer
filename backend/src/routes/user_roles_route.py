from flask import Blueprint, request
from flask_jwt_extended import jwt_required, current_user

from ..core.api_responses import response_success
from ..core.enums import RoleType
from ..core.exceptions.custom_exceptions import ResourceCustomError, AuthCustomError
from ..core.extensions import db
from ..models.user_role_model import UserRoleModel
from ..schemas.user_role_schema import UserRoleSchema

user_roles = Blueprint("user_roles", __name__, url_prefix="/user-roles")


@user_roles.route("/", methods=["GET"])
@jwt_required()
def get_user_roles():
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	all_user_roles = UserRoleModel.query.all()
	user_roles_schema = UserRoleSchema(many=True)
	return user_roles_schema.dump(all_user_roles), 200


@user_roles.route("/", methods=["POST"])
@jwt_required()
def add_user_role():
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	user_role_data = request.get_json()
	
	user_role_schema = UserRoleSchema(load_instance=True)
	
	new_user_role = user_role_schema.load(user_role_data)
	
	db.session.add(new_user_role)
	db.session.commit()
	
	return user_role_schema.dump(new_user_role), 201


@user_roles.route("/<user_role_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_user_role(user_role_id):
	if current_user.role != RoleType.ADMIN.value:
		raise AuthCustomError("forbidden")
	user_role = UserRoleModel.query.get(user_role_id)
	if not user_role:
		raise ResourceCustomError("not_found", "rol de usuario")
	user_role_schema = UserRoleSchema()
	
	if request.method == "PUT":
		user_role_data = request.get_json()
		
		context = {
			"expected_email": user_role.email,
		}
		user_role_schema.context = context
		user_role_update = user_role_schema.load(user_role_data)
		
		user_role.role = user_role_update["role"]
		
		db.session.commit()
		
		return user_role_schema.dump(user_role)
	
	if request.method == "DELETE":
		db.session.delete(user_role)
		db.session.commit()
		
		return response_success("el rol de usuario", "eliminado")
	
	return user_role_schema.dump(user_role)
