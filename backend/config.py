import os
from datetime import timedelta

# load_dotenv(".env.dev")

CONFIG_MODE = os.getenv("CONFIG_MODE")

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
REDIS_USER = os.getenv("REDIS_USER", None)

API_KEY_STRIPE = os.getenv("API_KEY_STRIPE")
WEBHOOK_SECRET_STRIPE = os.getenv("WEBHOOK_SECRET_STRIPE", None)


class Config:
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	CORS_SUPPORTS_CREDENTIALS = True
	SECRET_KEY = os.getenv("SECRET_KEY")
	JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
	JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
	# TODO: Configurar variable de entorno para producción
	SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI")


class DevelopmentConfig(Config):
	DEBUG = True
	PORT = int(os.getenv("PORT", 5000))
	MODE = CONFIG_MODE


ConfigModeEnum = {
	"development": DevelopmentConfig,
	"production": Config,
}

CONFIG = ConfigModeEnum[CONFIG_MODE]
