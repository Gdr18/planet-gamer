import re

from marshmallow import pre_load, ValidationError, validate

from src.extensions import ma
from ..models.user_model import UserModel
from ..schemas.address_schema import AddressSchema
from ..schemas.item_basket_schema import ItemBasketSchema
from ..schemas.order_schema import OrderSchema
from ..schemas.user_role_schema import UserRoleSchema


class UserSchema(ma.SQLAlchemyAutoSchema):
	email = ma.Email(required=True, validate=validate.Length(min=1, max=100,
	                                                         error="El campo 'email' debe tener entre 1 y 100 caracteres."))
	name = ma.String(required=True, validate=validate.Length(min=1, max=50,
	                                                         error="El campo 'name' debe tener entre 1 y 50 caracteres."))
	password = ma.String(required=True)
	surnames = ma.String(
		validate=validate.Length(min=1, max=100, error="El campo 'surnames' debe tener entre 1 y 100 caracteres."),
		allow_none=True
	)
	phone_number = ma.String(
		validate=validate.Regexp(regex=r"^(?:\+34\s?)?(6\d{8}|7[1-9]\d{7})$",
		                         error="El campo 'phone_number' no cumple con el patrón, ejemplos válidos: '666666666' o '+34666666666'"),
		allow_none=True
	)
	role = ma.Function(lambda obj: obj.role)
	user_role = ma.Nested(UserRoleSchema, exclude=["email"], use_list=False)
	
	class Meta:
		model = UserModel
		dump_only = ["id", "role"]
		unknown = "exclude"
		exclude = ["user_role"]
	
	@pre_load
	def validate_values(self, data, **kwargs):
		expected_password = self.context.get("expected_password")
		
		regex_password_hash = re.compile(r"^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$")
		regex_password = re.compile(
			r'^(?=.*[a-záéíóúüñ])(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{}|;:\'",.<>?/]).{7,}$',
			re.UNICODE,
		)
		
		if not re.match(regex_password, expected_password) and not re.match(
			regex_password_hash, expected_password
		):
			raise ValidationError("El campo 'password' no cumple con el patrón y tampoco es una contraseña hasheada.")
		return data


class UserBasketSchema(UserSchema):
	basket = ma.Nested(ItemBasketSchema, many=True, exclude=["user_id"], dump_only=True)


class UserFullSchema(UserBasketSchema):
	addresses = ma.Nested(AddressSchema, many=True, exclude=["user_id"], dump_only=True)
	orders = ma.Nested(OrderSchema, many=True, exclude=["user_id"], dump_only=True)
