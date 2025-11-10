from flask import request, Blueprint, jsonify

from ..utils.instantiations import db
from ..models.order_details_model import OrderDetailsModel
from ..schemas.order_details_schema import OrderDetailsSchema


orders_details_schema = OrderDetailsSchema(many=True)


orders_details = Blueprint("orders_details", __name__, url_prefix="/orders-details")


@orders_details.route("/", methods=["POST"])
def add_order_details():
    order_details_data = request.get_json()

    order_details_schema = OrderDetailsSchema(load_instance=True)

    new_order_details = order_details_schema.load(order_details_data)

    db.session.add(new_order_details)
    db.session.commit()

    order_details = OrderDetailsModel.query.get(new_order_details.id)

    return order_details_schema.jsonify(order_details), 201


@orders_details.route("/", methods=["GET"])
def get_order_details():
    all_orders_details = OrderDetailsModel.query.all()
    return orders_details_schema.jsonify(all_orders_details), 200


@orders_details.route("/<order_details_id>", methods=["GET", "PUT", "DELETE"])
def handle_order_details(order_details_id):
    order_details = OrderDetailsModel.query.get(order_details_id)
    order_details_schema = OrderDetailsSchema()

    if request.method == "PUT":
        order_details_data = request.get_json()

        context = {
            "mode": "update",
            "expected_game_id": order_details.game_id,
            "expected_order_id": order_details.order_id,
        }
        order_details_schema.context = context
        order_details_schema.load(order_details_data)

        for key, value in order_details_data.items():
            setattr(order_details, key, value)

        db.session.commit()

    if request.method == "DELETE":
        db.session.delete(order_details)
        db.session.commit()
        return (
            jsonify(msg="Los detalles del pedido han sido eliminados correctamente"),
            200,
        )

    return order_details_schema.jsonify(order_details), 200


@orders_details.route("/orders/<order_id>", methods=["GET"])
def get_orders_details(order_id):
    all_orders_details = OrderDetailsModel.query.filter_by(
        details_order_id=order_id
    ).all()
    return orders_details_schema.jsonify(all_orders_details), 200
