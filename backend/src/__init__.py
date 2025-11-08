from flask import Flask, jsonify
from flask_cors import CORS

from .utils.instantiations import db, bcrypt, ma

from .routes.addresses_route import address
from .routes.baskets_route import basket
from .routes.users_route import users
from .routes.games_route import game
from .routes.user_roles_route import role
from .routes.orders_route import order
from .routes.orders_details_route import order_details
from .services.auth_service import auth

# from .models.order_details_model import OrderDetails
# from .models.basket_model import Basket


app = Flask(__name__, static_url_path="")

cors = CORS()


@app.route("/", methods=["GET"])
def welcome():
    return "Bienvenidx a la API REST de Planet Gamer!", 200


def create_app(config):
    app.config.from_object(config)

    db.init_app(app)
    cors.init_app(app)
    bcrypt.init_app(app)
    ma.init_app(app)

    app.register_blueprint(users)
    app.register_blueprint(order)
    app.register_blueprint(order_details)
    app.register_blueprint(address)
    app.register_blueprint(basket)
    app.register_blueprint(game)
    app.register_blueprint(role)
    app.register_blueprint(auth)

    with app.app_context():
        # OrderDetails.__table__.drop(bind=db.engine)
        # Game.__table__.drop(bind=db.engine)
        db.create_all()

    return app
