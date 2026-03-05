from decimal import Decimal

from src.core.exceptions.custom_exceptions import ResourceCustomError
from src.core.extensions import db
from src.schemas.order_item_schema import OrderItemSchema
from src.schemas.order_schema import OrderSchema


class OrderService:
	
	@staticmethod
	def post_order_and_items(order, items):
		total_order = sum(
			Decimal(str(item["price"])) * Decimal(str(item["qty"]))
			for item in items
		).quantize(Decimal("0.01"))
		
		print(f"Total calculado: {type(total_order)}, Total proporcionado: {type(Decimal(str(order["total"])))}")
		if total_order != Decimal(str(order["total"])):
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
			
			return new_order
		except Exception as e:
			db.session.rollback()
			raise e
