from flask import jsonify
from sqlalchemy.exc import IntegrityError
from stripe import CardError, InvalidRequestError

from src.core.responses.api_responses import DbCustomResponses
from ..exceptions.custom_exceptions import StripeCustomError, ResourceCustomError


def stripe_error_handler(error):
	if isinstance(error, CardError):
		return StripeCustomError("paid_rejected").json_response()
	elif isinstance(error, InvalidRequestError):
		return StripeCustomError("invalid_request").json_response()
	elif isinstance(error, StripeCustomError):
		return error.json_response()
	
	return jsonify(err="stripe_error", msg=f"Error inesperado de Stripe: {error}"), 500


def error_handler(error):
	return error.json_response()


def db_validation_error_handler(error):
	return DbCustomResponses(error.messages).json_response()


def db_error_handler(error):
	if isinstance(error, IntegrityError):
		return jsonify(err="db_integrity_error",
		               msg="Error de integridad en la base de datos: posible duplicado o clave foránea inválida."), 400
	return jsonify(err="db_generic_error", msg=f"Error inesperado en la base de datos: {str(error)}"), 500


def generic_error_handler(error):
	if isinstance(error, KeyError):
		return jsonify(err="key_error", msg=f"Falta la clave: {str(error)}"), 400
	elif isinstance(error, TypeError):
		return jsonify(err="type_error", msg=f"Error de tipo: {str(error)}"), 400
	elif isinstance(error, ValueError):
		return jsonify(err="value_error", msg=f"Error de valor: {str(error)}"), 400
	elif getattr(error, "code") == 404:
		return ResourceCustomError("not_found", "recurso").json_response()
	return jsonify(err="generic_error", msg=f"Error inesperado: {str(error)}"), 500
