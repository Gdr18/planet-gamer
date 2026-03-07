from src.core.exceptions.custom_exceptions import ResourceCustomError
from src.core.extensions import db
from src.schemas.order_item_schema import OrderItemSchema
from src.schemas.order_schema import OrderSchema


class OrderService:
	@staticmethod
	def post_order_and_items(order, items):
		total_order = items.map(lambda item: item["price_in_cents"] * item["quantity"]).sum()
		
		print(f"Total calculado: {total_order}, Total proporcionado: {order["total"]}")
		if total_order != order["total"]:
			raise ResourceCustomError("total_mismatch")
		
		order_item_schema = OrderItemSchema(load_instance=True)
		order_schema = OrderSchema(load_instance=True)
		
		try:
			new_order = order_schema.load(order)
			
			db.session.add(new_order)
			db.session.flush()
			
			for item in items:
				new_item = order_item_schema.load(item)
				new_item.order_id = new_order.id
				db.session.add(new_item)
			
			db.session.commit()
			
			return new_order
		except Exception as e:
			db.session.rollback()
			raise e
