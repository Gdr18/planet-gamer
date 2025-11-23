from flask import jsonify


class StripeCustomError(Exception):
	def __init__(self, error: str):
		self.error = error
		self.code = 400
		
		if error == "paid_rejected":
			self.message = "Pago rechazado por Stripe"
			self.code = 402
		elif error == "requires_payment_method":
			self.message = "Se requiere un método de pago"
		elif error == "invalid_request":
			self.message = "Solicitud inválida a Stripe"
		else:
			self.message = "Estado no capturado de Stripe"
	
	def json_response(self):
		return jsonify(err=self.error, msg=self.message), self.code


class ResourceCustomError(Exception):
	def __init__(self, error: str, resource: str | None = None):
		self.error = error
		
		if self.error == "not_found":
			self.message = f"{resource.capitalize()} no encontrado/a"
			self.code = 404
		elif self.error == "invalid_data":
			self.message = f"{resource.capitalize()} inválido/a"
			self.code = 400
	
	def json_response(self):
		return jsonify(err=self.error, msg=self.message), self.code


class AuthCustomError(Exception):
	def __init__(self, error: str, details: str | None = None):
		self.error = error
		self.code = 401
		
		if self.error == "expired_token":
			self.message = "El token ha expirado"
		elif self.error == "invalid_token":
			self.message = f"Token inválido{f': {details}' if details else ''}"
		elif self.error == "revoked_token":
			self.message = "El token ha sido revocado"
		elif self.error == "not_token":
			self.message = f"No se proporcionó ningún token{f': {details}' if details else ''}"
		elif self.error == "password_mismatch":
			self.message = "La contraseña no coincide"
	
	def json_response(self):
		return jsonify(err=self.error, msg=self.message), self.code
