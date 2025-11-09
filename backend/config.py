import os

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
