from redis import Redis

from config import REDIS_HOST, REDIS_PORT

re = Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)


def set_revoked_token(payload: dict) -> bool:
    time_exp = 900  # 15 minutos
    return re.setex(f"revoked:{payload["jti"]}", time_exp, payload["sub"])


def exists_revoked_token(jti: str) -> bool:
    return re.exists(f"revoked:{jti}")


def set_refresh_token(payload: dict) -> bool:
    time_exp = 1209600  # 14 días
    return re.setex(f"refresh:{payload["jti"]}", time_exp, payload["sub"])


def exists_refresh_token(jti: str) -> bool:
    return re.exists(f"refresh:{jti}")
