from flask import jsonify
from stripe import CardError, InvalidRequestError

from ..exceptions.custom_exceptions import StripeCustomError, MarshmallowCustomError


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


def marshmallow_validation_error_handler(error):
	print(error, "error")
	return MarshmallowCustomError(error.messages).json_response()
