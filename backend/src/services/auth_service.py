from flask import Blueprint, request, session

from ..utils.instantiations import db, bcrypt
from ..models.user_model import User
from ..models.role_model import Role
from ..routes.user_route import user_schema

auth = Blueprint("auth", __name__)


@auth.route(
    "/auth",
    methods=["GET", "POST", "DELETE"],
)
def login():
    if request.method == "POST":
        email = request.json["email"]
        password = request.json["password"]
        name = request.json["name"]

        user_exists = User.query.filter_by(email=email).first()
        user_role = Role.query.filter_by(email=email).first()

        if user_exists:
            if not bcrypt.check_password_hash(user_exists.password, password):
                return {"error": "Contraseña equivocada"}, 401
            else:
                session["email"] = email
                session["role"] = user_exists.role
                return user_schema.jsonify(user_exists)
        elif user_exists is None and name != "":
            password = bcrypt.generate_password_hash(password).decode("utf-8")
            role = user_role.type if user_role is not None else 3

            new_user = User(email, name, password, role)

            db.session.add(new_user)
            db.session.commit()

            session["email"] = email
            session["role"] = role

            user = User.query.get(new_user.id)

            return user_schema.jsonify(user)
        else:
            return {"name": name}
    if request.method == "GET":
        getting_session = session.get("email", "")
        if getting_session == "":
            return {"loggedIn": False}
        else:
            getting_email = session["email"]
            user = User.query.filter_by(email=getting_email).first()
            return {"loggedIn": True, "id": user.id}
    if request.method == "DELETE":
        session.pop("email", None)
        return {"loggedOut": True}
