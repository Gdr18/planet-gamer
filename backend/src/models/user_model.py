from ..utils.instantiations import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.Integer, nullable=False)
    surnames = db.Column(db.String(100))
    phone_number = db.Column(db.String(9))
    addresses = db.relationship('Address', cascade="all, delete", backref='user', lazy=True)
    orders = db.relationship('Order', cascade="all, delete", backref='user', lazy=True)
    
    def __init__(self, email, name, password, role, surnames=None, phone_number=None):
        self.email = email
        self.name = name
        self.password = password
        self.role = role
        self.surnames = surnames
        self.phone_number = phone_number
