from flask import Flask, jsonify
from flask_cors import CORS

from .utils.instantiations import db, bcrypt, ma

from .routes.address_route import address
from .routes.basket_route import basket
from .routes.user_route import user
from .routes.game_route import game
from .routes.role_route import role
from .routes.order_route import order
from .routes.order_details_route import order_details
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

    app.register_blueprint(user)
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
