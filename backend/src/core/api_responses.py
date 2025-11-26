from flask import jsonify


def msg_success(resource: str, action: str) -> str:
	return f"{resource.capitalize()} ha sido {action} de forma correcta."


def response_success(resource: str, action: str, status_code: int = 200) -> tuple:
	return jsonify(msg=msg_success(resource, action)), status_code


def payment_response_success(payment_id: str, client_secret: str, status: str) -> tuple:
	response_data = {
		"payment_id": payment_id,
		"client_secret": client_secret,
		"status": status
	}
	return jsonify(**response_data), 200


class DbCustomResponses(Exception):
	def __init__(self, error: dict):
		self.error = error
		self.code = 400
		self.message = ""
		self.err = "db_validation_error"
		
		for field, message in self.error.items():
			if message[0] == "Missing data for required field.":
				self.message += f"Falta el campo '{field}'. "
			elif message[0].startswith("Not a valid"):
				type_field = message[0].split("Not a valid ")[1].split(".")[0]
				self.message += f"El campo '{field}' debe ser de tipo '{type_field}'. "
			elif message[0].startswith("Length must be between"):
				start_length = message[0].split("Length must be between ")[1].split(" ")[0]
				finish_length = message[0].split("and ")[1].split(".")[0]
				self.message += f"El campo '{field}' debe tener una longitud entre {start_length} y {finish_length} caracteres. "
			elif message[0].startswith("Must be one of"):
				values = message[0].split("Must be one of: ")[1]
				self.message += f"El campo '{field}' debe contener uno de los siguientes valores: {values} "
			elif message[0].startswith("Field may not be null"):
				self.message += f"El campo '{field}' no puede ser nulo. "
			else:
				self.message += f"{message[0]} "
	
	def json_response(self):
		return jsonify(err=self.err, msg=self.message), self.code
