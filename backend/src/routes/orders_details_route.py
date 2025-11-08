from flask import request, Blueprint

from ..utils.instantiations import db, ma
from ..models.order_details_model import OrderDetails


class OrderDetailsSchema(ma.Schema):
    class Meta:
        fields = ("id", "qty", "price", "details_game_id", "details_order_id")


order_details_schema = OrderDetailsSchema()
orders_details_schema = OrderDetailsSchema(many=True)


order_details = Blueprint("order_details", __name__)


@order_details.route('/order-details', methods=['POST'])
def posting_details():
    new_order_details = OrderDetails(**request.json)

    db.session.add(new_order_details)
    db.session.commit()

    order_details = OrderDetails.query.get(new_order_details.id)

    return order_details_schema.jsonify(order_details)


@order_details.route('/order-details/<id>', methods=['GET', 'PUT', 'DELETE'])
def select_order_details(id):
    order_details = OrderDetails.query.get(id)
    if request.method == 'GET':
        return order_details_schema.jsonify(order_details)

    if request.method == 'PUT':
        for key, value in request.json.items():
            setattr(order_details, key, value)
        db.session.commit()
        return order_details_schema.jsonify(order_details)

    if request.method == 'DELETE':
        db.session.delete(order_details)
        db.session.commit()
        return f'The order details with id {id} was deleted.'


@order_details.route('/orders-details', methods=['GET'])
def select_orders_details():
    all_orders_details = OrderDetails.query.all()
    return orders_details_schema.jsonify(all_orders_details)


@order_details.route('/orders-details/<details_order_id>', methods=['GET', 'POST', 'DELETE'])
def get_orders_details(details_order_id):
    orders_details = OrderDetails.query.filter_by(details_order_id=details_order_id).all()
    if request.method == 'GET':
        return orders_details_schema.jsonify(orders_details)

    if request.method == 'POST':
        for order_details in request.json:
            new_order_details = OrderDetails(details_order_id, **order_details)
            db.session.add(new_order_details)

        db.session.commit()
        orders_details = OrderDetails.query.filter_by(details_order_id=details_order_id)

        return orders_details_schema.jsonify(orders_details)

    if request.method == 'DELETE':
        for order_details in orders_details:
            db.session.delete(order_details)

        db.session.commit()
        return f'The orders details with order_id {details_order_id} were deleted.'
