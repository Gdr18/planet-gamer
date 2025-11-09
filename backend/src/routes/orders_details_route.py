from flask import request, Blueprint, jsonify

from ..utils.instantiations import db, ma
from ..models.order_details_model import OrderDetails


class OrderDetailsSchema(ma.Schema):
    class Meta:
        fields = ("id", "qty", "price", "details_game_id", "details_order_id")


order_details_schema = OrderDetailsSchema()
orders_details_schema = OrderDetailsSchema(many=True)


orders_details = Blueprint("orders_details", __name__, url_prefix="/orders-details")


@orders_details.route("/", methods=["POST"])
def add_order_details():
    new_order_details = OrderDetails(**request.json)

    db.session.add(new_order_details)
    db.session.commit()

    order_details = OrderDetails.query.get(new_order_details.id)

    return order_details_schema.jsonify(order_details), 201


@orders_details.route("/", methods=["GET"])
def get_order_details():
    all_orders_details = OrderDetails.query.all()
    return orders_details_schema.jsonify(all_orders_details), 200


@orders_details.route("/<order-details-id>", methods=["GET", "PUT", "DELETE"])
def handle_order_details(order_details_id):
    order_details = OrderDetails.query.get(order_details_id)
    if request.method == "PUT":
        for key, value in request.json.items():
            setattr(order_details, key, value)
        db.session.commit()

    if request.method == "DELETE":
        db.session.delete(order_details)
        db.session.commit()
        return jsonify(msg="El pedido ha sido eliminado correctamente"), 200

    return order_details_schema.jsonify(order_details), 200


@orders_details.route("/orders/<order-id>", methods=["GET"])
def get_orders_details(order_id):
    all_orders_details = OrderDetails.query.filter_by(details_order_id=order_id).all()
    return orders_details_schema.jsonify(all_orders_details), 200
