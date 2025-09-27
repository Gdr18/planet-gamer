from flask import request, Blueprint

from ..utils.instantiations import ma, db
from ..models.user_model import User
from ..models.order_model import Order


class OrderSchema(ma.Schema):
    class Meta:
        fields = ("id", "total", "qty", "order_user_id", "date", "order_address_id")


order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)

order = Blueprint("order", __name__)


@order.route("/orders", methods=["GET"])
def select_orders():
    all_orders = Order.query.all()
    return orders_schema.jsonify(all_orders)


@order.route("/orders/<order_user_id>", methods=["GET"])
def get_orders(order_user_id):
    user = User.query.get(order_user_id)
    if user is not None:
        orders = user.orders
        for order in orders:
            order.date = order.date.strftime("%d-%m-%Y, %H:%M:%S")
        return orders_schema.jsonify(orders)
    else:
        return "User not found"


@order.route("/order", methods=["POST"])
def post_order():
    new_order = Order(**request.json)

    db.session.add(new_order)
    db.session.commit()

    order = Order.query.get(new_order.id)
    return order_schema.jsonify(order)


@order.route("/order/<id>", methods=["GET", "PUT", "DELETE"])
def select_order(id):
    order = Order.query.get(id)
    if request.method == "GET":
        return order_schema.jsonify(order)

    if request.method == "PUT":
        for key, value in request.json.items():
            setattr(order, key, value)

        db.session.commit()
        return order_schema.jsonify(order)

    if request.method == "DELETE":
        db.session.delete(order)
        db.session.commit()

        return f"The order {id} was successfully deleted"
