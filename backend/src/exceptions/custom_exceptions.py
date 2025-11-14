from flask import jsonify


class StripeCustomError(Exception):
	def __init__(self, status: str):
		self.status = status
		self.code = 400
		
		if status == "payment_failed":
			self.message = "El pago ha fallado"
		elif status == "requires_payment_method":
			self.message = "Se requiere un método de pago"
		elif status == "wrong_payment_method":
			self.message = "Error con el método de pago"
		else:
			self.message = "Error inesperado de Stripe"
			self.code = 500
	
	def json_response(self):
		return jsonify(status=self.status, msg=self.message), self.code


class ValidationCustomError(Exception):
	def __init__(self, error: str, resource: str):
		self.error = error
		self.code = 500
		self.message = None
		
		if self.error == "not_found":
			self.message = f"{resource.capitalize()} no encontrado/a"
			self.code = 404
		elif self.error == "invalid_data":
			self.message = f"{resource.capitalize()} inválido/a"
			self.code = 400
	
	def json_response(self):
		return jsonify(err=self.error, msg=self.message), self.code
