from sqlalchemy import event, update

from src.services.db_service import db
from .user_model import UserModel

ROLE_TYPES = {"admin": 1, "staff": 2, "customer": 3}


class UserRoleModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    role = db.Column(db.Integer, default=ROLE_TYPES["customer"], nullable=False)

    def __init__(self, email, role=None):
        self.email = email
        self.role = role


@event.listens_for(UserRoleModel, "after_insert")
@event.listens_for(UserRoleModel, "after_update")
def sync_with_user(mapper, connection, target):
    stmt = (
        update(UserModel)
        .where(UserModel.email == target.email)
        .values(role=target.role)
    )
    connection.execute(stmt)


@event.listens_for(UserRoleModel, "after_delete")
def set_role_default(mapper, connection, target):
    stmt = (
        update(UserModel)
        .where(UserModel.email == target.email)
        .values(role=ROLE_TYPES["customer"])
    )
    connection.execute(stmt)
