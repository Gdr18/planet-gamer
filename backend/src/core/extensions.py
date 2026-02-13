from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

ma = Marshmallow()

cors = CORS(
	resources={r"/*": {"origins": ["http://localhost:5173", "https://planet-gamer-frontend.onrender.com"]}},
	supports_credentials=True,
	allow_headers=["Content-Type", "Authorization"],
	methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)
