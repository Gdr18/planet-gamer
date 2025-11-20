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


def value_custom_error_handler(error):
	return error.json_response()


def db_validation_error_handler(error):
	print(error, "error")
	if isinstance(error, IntegrityError):
		return jsonify(err="db_integrity_error",
		               msg="Error de integridad en la base de datos: posible duplicado o clave foránea inválida."), 400
	elif isinstance(error, SQLAlchemyError):
		return jsonify(err="db_generic_error", msg=f"Error inesperado en la base de datos: {str(error)}"), 500
	return DbCustomResponses(error.messages).json_response()


def generic_error_handler(error):
	if isinstance(error, KeyError):
		return jsonify(err="key_error", msg=f"Falta la clave: {str(error)}"), 400
	elif isinstance(error, TypeError):
		return jsonify(err="type_error", msg=f"Error de tipo: {str(error)}"), 400
	elif isinstance(error, ValueError):
		return jsonify(err="value_error", msg=f"Error de valor: {str(error)}"), 400
	elif getattr(error, 'code', None) == 404:
		return jsonify(err="not_found", msg="Recurso no encontrado"), 404
	return jsonify(err="generic_error", msg=f"Error inesperado: {str(error)}"), 500
