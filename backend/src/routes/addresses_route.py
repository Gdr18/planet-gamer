from flask import Blueprint, request, jsonify

from ..exceptions.custom_exceptions import ValueCustomError
from ..models.address_model import AddressModel, unset_previous_default
from ..schemas.address_schema import AddressSchema
from ..services.db_service import db

addresses_schema = AddressSchema(many=True)

addresses = Blueprint("addresses", __name__, url_prefix="/addresses")


@addresses.route("/", methods=["POST"])
def add_address():
	address_data = request.get_json()
	address_schema = AddressSchema(load_instance=True)
	
	new_address = address_schema.load(address_data)
	
	db.session.add(new_address)
	
	if new_address.default:
		unset_previous_default(new_address)
	
	db.session.commit()
	
	return address_schema.jsonify(new_address), 201


@addresses.route("/", methods=["GET"])
def get_addresses():
	all_addresses = AddressModel.query.all()
	return addresses_schema.jsonify(all_addresses), 200


@addresses.route("/<address_id>", methods=["GET", "PUT", "DELETE"])
def handle_address(address_id):
	address = AddressModel.query.get(address_id)
	address_schema = AddressSchema(unknown="exclude")
	if not address:
		raise ValueCustomError("not_found", "dirección")
	
	if request.method == "PUT":
		address_data = request.get_json()
		
		context = {
			"expected_user_id": address.user_id,
		}
		address_schema.context = context
		
		address_instance = address_schema.load(address_data)
		
		allowed_fields = address_schema.fields.keys()
		for key, value in address_instance.items():
			if key not in allowed_fields or key == "id":
				continue
			if key == "default" and value is True:
				unset_previous_default(address)
			setattr(address, key, value)
		
		db.session.commit()
		return address_schema.jsonify(address), 200
	
	if request.method == "DELETE":
		db.session.delete(address)
		db.session.commit()
		
		return jsonify(msg="La dirección ha sido eliminada correctamente"), 200
	
	return address_schema.jsonify(address), 200


@addresses.route("/users/<user_id>", methods=["GET"])
def get_addresses_user(user_id):
	user_addresses = AddressModel.query.filter_by(user_id=user_id).all()
	return addresses_schema.jsonify(user_addresses), 200
