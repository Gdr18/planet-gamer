import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv(".env.dev")


class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_PERMANENT = True
    SESSION_TYPE = "filesystem"
    PERMANENT_SESSION_LIFETIME = 4000
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    CORS_SUPPORTS_CREDENTIALS = True
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI")


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI")


ConfigModeEnum = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}

CONFIG = ConfigModeEnum[os.getenv("CONFIG_MODE")]
PORT = int(os.getenv("PORT", 5000))
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT"))
API_KEY_STRIPE = os.getenv("API_KEY_STRIPE")
