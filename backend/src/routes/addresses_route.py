from flask import Blueprint, request, jsonify

from ..utils.instantiations import ma, db
from ..models.address_model import Address


class AddressSchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "street",
            "second_line_street",
            "postal_code",
            "city",
            "address_user_id",
        )


address_schema = AddressSchema()
addresses_schema = AddressSchema(many=True)

addresses = Blueprint("addresses", __name__, url_prefix="/addresses")


@addresses.route("/", methods=["POST"])
def add_address():
    address_data = request.get_json()

    new_address = Address(**address_data)

    db.session.add(new_address)
    db.session.commit()

    address = Address.query.get(new_address.id)

    return address_schema.jsonify(address), 201


@addresses.route("/", methods=["GET"])
def get_addresses():
    all_addresses = Address.query.all()
    return addresses_schema.jsonify(all_addresses), 200


@addresses.route("/<address_id>", methods=["GET", "DELETE", "PUT"])
def handle_address(address_id):
    address = Address.query.get(address_id)

    if request.method == "DELETE":
        db.session.delete(address)
        db.session.commit()

        return jsonify(msg="La dirección ha sido eliminada correctamente"), 200

    if request.method == "PUT":
        address_data = request.get_json()

        # TODO: Falta filtrar resultados
        address.street = address_data["street"]
        address.second_line_street = address_data["second_line_street"]
        address.postal_code = address_data["postal_code"]
        address.city = address_data["city"]

        db.session.commit()
        return address_schema.jsonify(address), 200

    return address_schema.jsonify(address), 200


@addresses.route("/users/<user_id>", methods=["GET"])
def get_addresses_user(user_id):
    address = Address.query.filter_by(address_user_id=user_id).all()
    return address_schema.jsonify(address), 200
