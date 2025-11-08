from flask import Blueprint, request

from ..utils.instantiations import ma, db, bcrypt
from ..models.user_model import User


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

    user_data["password"] = bcrypt.generate_password_hash(user_data["password"]).decode("utf-8")

    user_instance = User(**user_data)

    db.session.add(user_instance)
    db.session.commit()

    new_user = User.query.get(user_data.id)

    return user_schema.jsonify(new_user)


@user.route("/user/<user_id>", methods=["GET", "DELETE", "PUT"])
def select_user(user_id):
    selected_user = User.query.get(user_id)

    if request.method == "DELETE":
        db.session.delete(selected_user)
        db.session.commit()
        return f"The user {user_id} was successfully deleted"

    elif request.method == "PUT":
        for key, value in request.json.items():
            if key == "password":
                if value != "" and not bcrypt.check_password_hash(selected_user.password, value):
                    selected_user.password = bcrypt.generate_password_hash(value).decode("utf-8")
            else:
                setattr(selected_user, key, value)

        db.session.commit()
        return user_schema.jsonify(selected_user)

    return user_schema.jsonify(selected_user)
