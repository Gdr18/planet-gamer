from flask_bcrypt import Bcrypt
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

ma = Marshmallow()

# Completar lógica de bcrypt
bcrypt = Bcrypt()


def add_order_and_items(order_data: dict, items_data: list) -> db.Model:
	from ..schemas.order_details_schema import OrderDetailsSchema
	from ..schemas.order_schema import OrderSchema
	
	order_item_schema = OrderDetailsSchema(load_instance=True)
	order_schema = OrderSchema(load_instance=True)
	
	new_order = order_schema.load(order_data)
	print(new_order)
	db.session.add(new_order)
	db.session.commit()
	
	for item in items_data:
		item["order_id"] = new_order.id
		new_item = order_item_schema.load(item)
		db.session.add(new_item)
	
	db.session.commit()
	return new_order
