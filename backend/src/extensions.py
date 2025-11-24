from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

ma = Marshmallow()

# TODO: Completar lógica de bcrypt
bcrypt = Bcrypt()

cors = CORS()
