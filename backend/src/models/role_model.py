from ..utils.instantiations import db


class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), unique=True, nullable=False)
    type = db.Column(db.Integer, nullable=False)

    def __init__(self, email, type):
        self.email = email
        self.type = type
