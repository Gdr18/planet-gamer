from flask import Blueprint, request, session

from ..utils.instantiations import ma, db
from ..models.role_model import Role
from ..models.user_model import User


class RoleSchema(ma.Schema):
    class Meta:
        fields = ("id", "email", "type")


role_schema = RoleSchema()
roles_schema = RoleSchema(many=True)

role = Blueprint("role", __name__)


def updating_role():
    usuarios_con_rol_actualizado = db.session.query(User, Role).join(Role, User.email == Role.email).filter(User.role != Role.type).all()

    for usuario, rol in usuarios_con_rol_actualizado:
        usuario.role = rol.type

    db.session.commit()


@role.route('/roles', methods=['GET'])
def select_roles():
    # if "email" not in session and "role" not in session and session["role"] <= 2:
    #     return "You are not authorized", 403
    all_roles = Role.query.all()
    return roles_schema.jsonify(all_roles)


@role.route("/role/<id>", methods=["GET", "PUT", "DELETE"])
def select_role(id):
    # TODO: Hay que comprobar si funciona la no autorización.
    # if "email" not in session and "role" not in session and "role" >= 2:
    #     return "You are not authorized", 403
    if request.method == "GET":
        role = Role.query.get(id)
        return role_schema.jsonify(role)

    if request.method == "DELETE":
        role = Role.query.get(id)

        db.session.delete(role)
        db.session.commit()
        updating_role()

        return f"The role {id} was successfully deleted"

    if request.method == "PUT":
        role = Role.query.get(id)
        type = request.json["type"]

        role.type = type

        db.session.commit()
        updating_role()

        return role_schema.jsonify(role)


@role.route("/role", methods=["POST"])
def post_role():
    # if "email" not in session and "role" not in session and session["role"] <= 2:
    #     return "You are not authorized", 403
    email = request.json["email"]
    type = request.json["type"]

    new_role = Role(email, type)

    db.session.add(new_role)
    db.session.commit()
    updating_role()

    role = Role.query.get(new_role.id)

    return role_schema.jsonify(role)
