from flask import jsonify


class StripeCustomError(Exception):
	def __init__(self, status, secret=None):
		self.status = status
		self.code = 400
		self.secret = secret
		
		if status == "payment_failed":
			self.message = "El pago ha fallado inesperadamente"
		elif status == "required_action":
			self.message = "Se requiere acción (3ds)"
		elif status == "required_payment_method":
			self.message = "Se requiere un método de pago"
		else:
			self.message = "Error inesperado de Stripe"
			self.code = 500
	
	def json_response(self):
		if self.secret:
			return jsonify(err=self.status, msg=self.message, client_secret=self.secret), self.code
		return jsonify(err=self.status, msg=self.message), self.code


class ValidationCustomError(Exception):
	def __init__(self, error: str, resource: str):
		self.error = error
		self.code = 500
		self.message = None
		
		if self.error == "not_found":
			self.message = f"{resource.capitalize()} no encontrado"
			self.code = 404
	
	def json_response(self):
		return jsonify(err=self.error, msg=self.message), self.code
