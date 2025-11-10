from flask import request, Blueprint, jsonify
from marshmallow import fields

from ..utils.instantiations import ma, db
from ..models.user_model import UserModel
from ..models.order_model import OrderModel


class OrderSchema(ma.Schema):
    date = fields.DateTime(dump_only=True, format="%d-%m-%YT%H:%M:%S")

    class Meta:
        fields = ("id", "total", "qty", "order_user_id", "order_address_id")


order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)

orders = Blueprint("orders", __name__, url_prefix="/orders")


@orders.route("/", methods=["GET"])
def select_orders():
    all_orders = OrderModel.query.all()
    return orders_schema.jsonify(all_orders)


@orders.route("/users/<user_id>", methods=["GET"])
def get_orders(user_id):
    # TODO: La consulta debería ser directa a Orders con el user_id
    user = UserModel.query.get(user_id)
    if user is None:
        return jsonify(msg="Usuario no encontrado"), 404

    user_orders = user.orders
    # TODO: Hacer conversión en OrderModel?
    for order in user_orders:
        order.created_at = order.created_at.strftime("%d-%m-%Y, %H:%M:%S")
    return orders_schema.jsonify(user_orders), 200


@orders.route("/", methods=["POST"])
def add_order():
    new_order = OrderModel(**request.get_json())

    db.session.add(new_order)
    db.session.commit()

    order = OrderModel.query.get(new_order.id)
    return order_schema.jsonify(order), 201


@orders.route("/<order_id>", methods=["GET", "PUT", "DELETE"])
def handle_order(order_id):
    order = OrderModel.query.get(order_id)
    if request.method == "PUT":
        for key, value in request.get_json().items():
            setattr(order, key, value)

        db.session.commit()
        return order_schema.jsonify(order)

    if request.method == "DELETE":
        db.session.delete(order)
        db.session.commit()

        return jsonify(msg="El pedido ha sido eliminado con éxito."), 200

    return order_schema.jsonify(order), 200
