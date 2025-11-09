from sqlalchemy import event

from ..utils.instantiations import db
from .user_model import User

ROLE_TYPES = {"admin": 1, "staff": 2, "customer": 3}


class UserRole(db.Model):
    email = db.Column(db.String(50), primary_key=True)
    role = db.Column(db.Integer, nullable=False)

    def __init__(self, email, role):
        self.email = email

        if role not in ROLE_TYPES.keys():
            raise ValueError("Rol inválido proporcionado.")

        self.role = ROLE_TYPES[role]


@event.listens_for(UserRole, "after_insert")
@event.listens_for(UserRole, "after_update")
def sync_with_user(mapper, connection, target):
    user = db.session.query(User).filter_by(email=target.email).first()
    if user:
        user.users_role = target.users_role


@event.listens_for(UserRole, "after_delete")
def set_role_default(mapper, connection, target):
    user = db.session.query(User).filter_by(email=target.email).first()
    if user:
        user.users_role = ROLE_TYPES["customer"]
