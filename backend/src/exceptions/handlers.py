from flask import jsonify
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from stripe import CardError, InvalidRequestError

from ..exceptions.custom_exceptions import StripeCustomError, DbCustomResponses


def stripe_error_handler(error):
	if isinstance(error, CardError):
		return StripeCustomError("paid_rejected").json_response()
	elif isinstance(error, InvalidRequestError):
		return StripeCustomError("invalid_request").json_response()
	elif isinstance(error, StripeCustomError):
		return error.json_response()
	
	return jsonify(err="stripe_error", msg=f"Error inesperado de Stripe: {error}"), 500


def validation_custom_error_handler(error):
	return error.json_response()


def db_validation_error_handler(error):
	print(error, "error")
	if isinstance(error, IntegrityError):
		return jsonify(err="db_integrity_error",
		               msg="Error de integridad en la base de datos: posible duplicado o clave foránea inválida."), 400
	elif isinstance(error, SQLAlchemyError):
		return jsonify(err="db_generic_error", msg=f"Error inesperado en la base de datos: {str(error)}"), 500
	return DbCustomResponses(error.messages).json_response()
