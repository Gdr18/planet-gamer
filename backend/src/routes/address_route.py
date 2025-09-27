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

address = Blueprint("address", __name__)


@address.route("/address/<address_user_id>", methods=["POST"])
def add_address(address_user_id):
    street = request.json["street"]
    second_line_street = request.json["second_line_street"]
    postal_code = request.json["postal_code"]
    city = request.json["city"]

    user_address = Address.query.filter_by(address_user_id=address_user_id).first()

    if user_address is not None:
        user_address.street = street
        user_address.second_line_street = second_line_street
        user_address.postal_code = postal_code
        user_address.city = city

        db.session.commit()
        return address_schema.jsonify(user_address)
    else:
        new_address = Address(
            street, second_line_street, postal_code, city, address_user_id
        )

        db.session.add(new_address)
        db.session.commit()

        address = Address.query.get(new_address.id)

        return address_schema.jsonify(address)


@address.route("/address-user/<address_user_id>", methods=["GET"])
def get_addresses(address_user_id):
    address = Address.query.filter_by(address_user_id=address_user_id).first()
    return address_schema.jsonify(address)


@address.route("/address/<id>", methods=["GET", "DELETE", "PUT"])
def select_address(id):
    if request.method == "GET":
        address = Address.query.get(id)
        return address_schema.jsonify(address)

    if request.method == "DELETE":
        address = Address.query.get(id)

        db.session.delete(address)
        db.session.commit()

        return f"The address {address.id} was successfully deleted"

    if request.method == "PUT":
        address = Address.query.get(id)
        street = request.json["street"]
        second_line_street = request.json["second_line_street"]
        postal_code = request.json["postal_code"]
        city = request.json["city"]

        address.street = street
        address.second_line_street = second_line_street
        address.postal_code = postal_code
        address.city = city

        db.session.commit()
        return address_schema.jsonify(address)


@address.route("/addresses", methods=["GET"])
def get_all_addresses():
    all_addresses = Address.query.all()
    result = addresses_schema.dump(all_addresses)
    return jsonify(result)
