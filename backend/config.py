import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv(".env.dev")

# TODO: COHERENCIA EN LAS VARIABLES DE ENTORNO
CONFIG_MODE = os.getenv("CONFIG_MODE")


class Config:
	MODE = CONFIG_MODE
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	CORS_SUPPORTS_CREDENTIALS = True
	SECRET_KEY = os.getenv("SECRET_KEY")
	JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
	JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
	# TODO: Configurar variable de entorno para producción
	SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI")


class DevelopmentConfig(Config):
	DEBUG = True


ConfigModeEnum = {
	"development": DevelopmentConfig,
	"production": Config,
}

CONFIG = ConfigModeEnum[CONFIG_MODE]
PORT = int(os.getenv("PORT", 5000))
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT"))
API_KEY_STRIPE = os.getenv("API_KEY_STRIPE")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
