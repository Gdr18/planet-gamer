from flask import Blueprint, request

from ..utils.instantiations import ma, db
from ..models.user_role_model import UserRoleModel


class RoleSchema(ma.Schema):
    class Meta:
        fields = ("email", "role")


role_schema = RoleSchema()
roles_schema = RoleSchema(many=True)

users_role = Blueprint("users_role", __name__, url_prefix="/users-role")


@users_role.route("/", methods=["GET"])
def get_roles():
    all_roles = UserRoleModel.query.all()
    return roles_schema.jsonify(all_roles)


@users_role.route("/", methods=["POST"])
def add_user_role():
    email = request.get_json()["email"]
    role = request.get_json()["role"]

    new_role = UserRoleModel(email, role)

    db.session.add(new_role)
    db.session.commit()

    role = UserRoleModel.query.get(new_role.email)

    return role_schema.jsonify(role)


@users_role.route("/<user_email>", methods=["GET", "PUT", "DELETE"])
def handle_role(user_email):
    user_role = UserRoleModel.query.get(user_email)

    if request.method == "DELETE":
        db.session.delete(user_role)
        db.session.commit()

        return f"The role was successfully deleted"

    if request.method == "PUT":
        role = request.get_json()["role"]

        user_role.role = role

        db.session.commit()

        return role_schema.jsonify(user_role)

    return role_schema.jsonify(user_role)
