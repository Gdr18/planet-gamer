from flask import jsonify


class StripeCustomError(Exception):
	def __init__(self, error: str, details: str | None = None):
		self.error = error
		self.code = 400
		
		if error == "paid_rejected":
			self.message = f"Pago rechazado por Stripe{f': {details}' if details else ''}"
			self.code = 402
		elif error == "requires_payment_method":
			self.message = "Se requiere un método de pago"
		elif error == "invalid_request":
			self.message = f"Solicitud inválida a Stripe{f': {details}' if details else ''}"
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
		elif self.error == "forbidden":
			self.message = "Acceso prohibido"
			self.code = 403
		elif self.error == "forbidden_action":
			self.message = f"Acción prohibida{f': {details}' if details else ''}"
			self.code = 403
	
	def json_response(self):
		return jsonify(err=self.error, msg=self.message), self.code
