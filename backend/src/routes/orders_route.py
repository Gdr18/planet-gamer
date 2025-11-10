from flask import request, Blueprint, jsonify

from ..utils.instantiations import db
from ..models.order_model import OrderModel
from ..schemas.order_schema import OrderSchema

orders = Blueprint("orders", __name__, url_prefix="/orders")

orders_schema = OrderSchema(many=True)


@orders.route("/", methods=["GET"])
def get_orders():
    all_orders = OrderModel.query.all()
    return orders_schema.jsonify(all_orders)


@orders.route("/", methods=["POST"])
def add_order():
    order_data = request.get_json()

    order_schema = OrderSchema(load_instance=True)

    new_order = order_schema.load(order_data)

    db.session.add(new_order)
    db.session.commit()

    order = OrderModel.query.get(new_order.id)
    return order_schema.jsonify(order), 201


@orders.route("/<order_id>", methods=["GET", "PUT", "DELETE"])
def handle_order(order_id):
    order = OrderModel.query.get(order_id)
    order_schema = OrderSchema()

    if request.method == "PUT":
        order_data = request.get_json()

        context = {"mode": "update", "expected_user_id": order.user_id}
        order_schema.context = context
        order_schema.load(order_data)

        for key, value in order_data.items():
            setattr(order, key, value)

        db.session.commit()
        return order_schema.jsonify(order)

    if request.method == "DELETE":
        db.session.delete(order)
        db.session.commit()

        return jsonify(msg="El pedido ha sido eliminado con éxito."), 200

    return order_schema.jsonify(order), 200


@orders.route("/users/<user_id>", methods=["GET"])
def get_orders_users(user_id):
    user_orders = OrderModel.query.filter_by(user_id=user_id).all()
    return orders_schema.jsonify(user_orders), 200
