from src.core.exceptions.custom_exceptions import ResourceCustomError
from src.core.extensions import db
from src.schemas.order_item_schema import OrderItemSchema
from src.schemas.order_schema import OrderSchema


class OrderService:
	
	@staticmethod
	def post_order_and_items(order, items):
		prices_to_sum = []
		for item in items:
			result = item["qty"] * item["price"]
			prices_to_sum.append(result)
		
		total_order = sum(prices_to_sum)
		
		if total_order != order["total"]:
			raise ResourceCustomError("total_mismatch")
		
		order_item_schema = OrderItemSchema(load_instance=True)
		order_schema = OrderSchema(load_instance=True)
		
		try:
			new_order = order_schema.load(order)
			
			db.session.add(new_order)
			db.session.flush()
			
			for item in items:
				item["orderId"] = new_order.id
				new_item = order_item_schema.load(item)
				db.session.add(new_item)
			
			db.session.commit()
			
			result = {
				"order": order_schema.dump(new_order),
				"items": order_item_schema.dump(new_order.items, many=True),
			}
			
			return result
		except Exception as e:
			db.session.rollback()
			raise e
