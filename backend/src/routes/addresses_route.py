from flask import Blueprint, request, jsonify

from ..utils.instantiations import db
from ..schemas.address_schema import AddressSchema
from ..models.address_model import Address

addresses_schema = AddressSchema(many=True)

addresses = Blueprint("addresses", __name__, url_prefix="/addresses")


@addresses.route("/", methods=["POST"])
def add_address():
    address_data = request.get_json()
    context = {"mode": "create"}
    address_schema = AddressSchema(load_instance=True, context=context)

    new_address = address_schema.load(address_data)

    db.session.add(new_address)
    db.session.commit()

    address = Address.query.get(new_address.id)

    return address_schema.jsonify(address), 201


@addresses.route("/", methods=["GET"])
def get_addresses():
    all_addresses = Address.query.all()
    return addresses_schema.jsonify(all_addresses), 200


@addresses.route("/<address_id>", methods=["GET", "PUT", "DELETE"])
def handle_address(address_id):
    address = Address.query.get(address_id)
    address_schema = AddressSchema()

    if request.method == "PUT":
        address_data = request.get_json()

        context = {
            "mode": "update",
            "expected_id": address_id,
            "expected_address_user_id": address.address_user_id,
        }
        address_schema.context = context

        address_schema.load(address_data)

        for key, value in address_data.items():
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
    user_addresses = Address.query.filter_by(address_user_id=user_id).all()
    return addresses_schema.jsonify(user_addresses), 200
