from flask import Flask
from marshmallow import ValidationError
from redis import RedisError
from sqlalchemy.exc import SQLAlchemyError
from stripe import StripeError

from src.core.extensions import db, ma, cors
from .core.exceptions.custom_exceptions import StripeCustomError, ResourceCustomError, AuthCustomError
from .core.exceptions.handlers import stripe_error_handler, error_handler, db_validation_error_handler, \
	generic_error_handler, db_error_handler, redis_error_handler
from .routes.addresses_route import addresses
from .routes.auth_route import auth
from .routes.basket_items_route import basket_items
from .routes.games_route import games
from .routes.main_route import main
from .routes.order_items_route import items_order
from .routes.orders_route import orders
from .routes.payment_route import payments
from .routes.user_roles_route import user_roles
from .routes.users_route import users
from .services.auth_service import jwt
from .services.bcrypt_service import bcrypt


def create_app(config):
	app = Flask(__name__, static_url_path="")
	
	app.config.from_object(config)
	
	app.register_error_handler(AuthCustomError, error_handler)
	
	app.register_error_handler(StripeError, stripe_error_handler)
	app.register_error_handler(StripeCustomError, stripe_error_handler)
	
	app.register_error_handler(ValidationError, db_validation_error_handler)
	app.register_error_handler(SQLAlchemyError, db_error_handler)
	app.register_error_handler(RedisError, redis_error_handler)
	
	app.register_error_handler(ResourceCustomError, error_handler)
	app.register_error_handler(Exception, generic_error_handler)
	
	db.init_app(app)
	cors.init_app(app)
	bcrypt.init_app(app)
	ma.init_app(app)
	jwt.init_app(app)
	
	app.register_blueprint(main)
	app.register_blueprint(users)
	app.register_blueprint(orders)
	app.register_blueprint(items_order)
	app.register_blueprint(addresses)
	app.register_blueprint(basket_items)
	app.register_blueprint(games)
	app.register_blueprint(user_roles)
	app.register_blueprint(auth)
	app.register_blueprint(payments)
	
	with app.app_context():
		db.create_all()
	
	return app
