from flask import Blueprint, request, jsonify

from ..utils.instantiations import ma, db, bcrypt
from ..models.user_model import User


class UserSchema(ma.Schema):
    class Meta:
        fields = ("id", "name", "email", "password", "surnames", "phone_number", "role")


user_schema = UserSchema()
users_schema = UserSchema(many=True)


users = Blueprint("users", __name__, url_prefix="/users")


@users.route("/", methods=["GET"])
def get_users():
    all_users = User.query.all()
    return users_schema.jsonify(all_users)


@users.route("/", methods=["POST"])
def add_user():
    user_data = request.get_json()

    user_data["password"] = bcrypt.generate_password_hash(user_data["password"]).decode(
        "utf-8"
    )

    new_user = User(**user_data)

    db.session.add(new_user)
    db.session.commit()

    new_user = User.query.get(user_data.id)

    return user_schema.jsonify(new_user)


@users.route("/<user_id>", methods=["GET", "DELETE", "PUT"])
def handle_user(user_id):
    user = User.query.get(user_id)

    if request.method == "DELETE":
        db.session.delete(user)
        db.session.commit()
        return jsonify(msg="El usuario ha sido eliminado correctamente"), 200

    elif request.method == "PUT":
        for key, value in request.get_json().items():
            if key == "password":
                if value != "" and not bcrypt.check_password_hash(user.password, value):
                    user.password = bcrypt.generate_password_hash(value).decode("utf-8")
            else:
                setattr(user, key, value)

        db.session.commit()
        return user_schema.jsonify(user)

    return user_schema.jsonify(user)
