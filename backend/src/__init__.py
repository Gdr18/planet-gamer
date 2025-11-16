from flask import Flask
from flask_cors import CORS
from stripe import StripeError

from .exceptions.custom_exceptions import StripeCustomError, ValidationCustomError
from .exceptions.handlers import stripe_errors_handler, validation_error_handler
from .routes.addresses_route import addresses
from .routes.auth_route import auth
from .routes.games_route import games
from .routes.items_basket_route import items_basket
from .routes.items_order_route import items_order
from .routes.orders_route import orders
from .routes.payment_route import payments
from .routes.user_roles_route import user_roles
from .routes.users_route import users
from .services.auth_service import jwt
from .services.db_service import db, bcrypt, ma

app = Flask(__name__, static_url_path="")

cors = CORS()


@app.route("/", methods=["GET"])
def welcome():
	return "Bienvenidx a la API REST de Planet Gamer!", 200


def create_app(config):
	app.config.from_object(config)
	
	app.register_error_handler(StripeError, stripe_errors_handler)
	app.register_error_handler(StripeCustomError, stripe_errors_handler)
	
	app.register_error_handler(ValidationCustomError, validation_error_handler)
	
	db.init_app(app)
	cors.init_app(app)
	bcrypt.init_app(app)
	ma.init_app(app)
	jwt.init_app(app)
	
	app.register_blueprint(users)
	app.register_blueprint(orders)
	app.register_blueprint(items_order)
	app.register_blueprint(addresses)
	app.register_blueprint(items_basket)
	app.register_blueprint(games)
	app.register_blueprint(user_roles)
	app.register_blueprint(auth)
	app.register_blueprint(payments)
	
	with app.app_context():
		db.create_all()
	
	return app
