from flask import request, Blueprint, jsonify

from ..utils.instantiations import ma, db
from ..models.user_model import User
from ..models.order_model import Order


class OrderSchema(ma.Schema):
    class Meta:
        fields = ("id", "total", "qty", "order_user_id", "date", "order_address_id")


order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)

orders = Blueprint("orders", __name__, url_prefix="/orders")


@orders.route("/", methods=["GET"])
def select_orders():
    all_orders = Order.query.all()
    return orders_schema.jsonify(all_orders)


@orders.route("/users/<user_id>", methods=["GET"])
def get_orders(user_id):
    # TODO: La consulta debería ser directa a Orders con el user_id
    user = User.query.get(user_id)
    if user is None:
        return jsonify(msg="Usuario no encontrado"), 404

    user_orders = user.orders
    # TODO: Hacer conversión en OrderModel?
    for order in user_orders:
        order.date = order.date.strftime("%d-%m-%Y, %H:%M:%S")
    return orders_schema.jsonify(user_orders), 200


@orders.route("/", methods=["POST"])
def add_order():
    new_order = Order(**request.json)

    db.session.add(new_order)
    db.session.commit()

    order = Order.query.get(new_order.id)
    return order_schema.jsonify(order), 201


@orders.route("/<order_id>", methods=["GET", "PUT", "DELETE"])
def handle_order(order_id):
    order = Order.query.get(order_id)
    if request.method == "PUT":
        for key, value in request.json.items():
            setattr(order, key, value)

        db.session.commit()
        return order_schema.jsonify(order)

    if request.method == "DELETE":
        db.session.delete(order)
        db.session.commit()

        return jsonify(msg="El pedido ha sido eliminado con éxito."), 200

    return order_schema.jsonify(order), 200
