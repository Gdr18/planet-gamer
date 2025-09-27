from flask import Blueprint, request

from ..utils.instantiations import ma, db, bcrypt
from ..models.user_model import User
from ..models.role_model import Role


class UserSchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "name",
            "email",
            "password",
            "surnames",
            "phone_number",
            "role"
        )


user_schema = UserSchema()
users_schema = UserSchema(many=True)


user = Blueprint("user", __name__)


@user.route("/users", methods=["GET"])
def get_users():
    all_users = User.query.all()
    return users_schema.jsonify(all_users)


@user.route("/user", methods=["POST"])
def add_user():
    user_data = request.json

    user_role = Role.query.filter_by(email=user_data["email"]).first()

    user_data["password"] = bcrypt.generate_password_hash(user_data["password"]).decode("utf-8")
    user_data["role"] = user_role.type if user_role is not None else 3

    new_user = User(**user_data)

    db.session.add(new_user)
    db.session.commit()

    user = User.query.get(new_user.id)

    return user_schema.jsonify(user)


@user.route("/user/<id>", methods=["GET", "DELETE", "PUT"])
def select_user(id):
    user = User.query.get(id)
    if request.method == "GET":
        return user_schema.jsonify(user)

    if request.method == "DELETE":
        db.session.delete(user)
        db.session.commit()

        return f"The user {id} was successfully deleted"

    if request.method == "PUT":
        for key, value in request.json.items():
            if key == "password":
                if value != "" and not bcrypt.check_password_hash(user.password, value):
                    user.password = bcrypt.generate_password_hash(value).decode("utf-8")
            elif key == "role":
                user.role = user.role
            else:
                setattr(user, key, value)

        db.session.commit()
        return user_schema.jsonify(user)
