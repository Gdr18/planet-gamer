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


class MarshmallowCustomError(Exception):
	def __init__(self, error: dict):
		self.error = error
		self.code = 400
		self.message = ""
		self.err = "validation_db"
		
		for field, message in self.error.items():
			if message[0] == "Missing data for required field.":
				self.message += f"Falta el campo: '{field}'. "
			elif message[0].startswith("Not a valid"):
				type_field = message[0].split("Not a valid ")[1].split(".")[0]
				self.message += f"El campo '{field}' debe ser de tipo '{type_field}'. "
			elif message[0].startswith("Unknown field."):
				self.message += f"El campo '{field}' no es reconocido. "
			elif message[0].startswith("Length must be between"):
				start_length = message[0].split("Length must be between ")[1].split(" ")[0]
				finish_length = message[0].split("and ")[1].split(".")[0]
				self.message += f"El campo '{field}' debe tener una longitud entre {start_length} y {finish_length} caracteres. "
			elif message[0].startswith("Longer than maximum length"):
				max_length = message[0].split("Longer than maximum length ")[1].split(".")[0]
				self.message += f"El campo '{field}' no debe exceder los {max_length} caracteres. "
			elif message[0].startswith("Must be one of"):
				values = message[0].split("Must be one of: ")[1]
				self.message += f"El campo '{field}' debe contener uno de los siguientes valores: {values} "
			elif message[0].startswith("Field may not be null"):
				self.message += f"El campo '{field}' no puede ser nulo. "
			else:
				self.message += f"{message[0]} "
	
	def json_response(self):
		return jsonify(err=self.err, msg=self.message), self.code
