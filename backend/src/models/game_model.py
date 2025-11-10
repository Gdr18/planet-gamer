from datetime import datetime

from ..utils.instantiations import db
from ..models.order_details_model import OrderDetails


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(1500), unique=True, nullable=False)
    platform = db.Column(db.String(20), nullable=False)
    gender = db.Column(db.String(30), nullable=False)
    pegi = db.Column(db.String(3), nullable=False)
    release = db.Column(db.String(4), nullable=False)
    price = db.Column(db.Numeric(precision=10, scale=2), nullable=False)
    img = db.Column(db.String(150), unique=True, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=100)
    date = db.Column(db.DateTime, nullable=False, default=datetime.now)
    details = db.relationship(OrderDetails, backref="game", lazy=True)

    def __init__(
        self,
        title,
        description,
        platform,
        gender,
        pegi,
        release,
        price,
        img,
        stock,
        date,
    ):
        self.title = title
        self.description = description
        self.platform = platform
        self.gender = gender
        self.pegi = pegi
        self.release = release
        self.price = price
        self.img = img
        self.stock = stock
        self.date = date
