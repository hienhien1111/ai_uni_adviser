from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

db = SQLAlchemy()

# Rate limiter — storage được cấu hình trong app.py (Redis hoặc memory)
limiter = Limiter(key_func=get_remote_address)

# Redis client — None nếu REDIS_URL không được cấu hình
redis_client = None


def init_redis(redis_url: str | None) -> None:
    """Khởi tạo Redis client nếu REDIS_URL được cấu hình.
    App vẫn hoạt động bình thường nếu Redis không khả dụng (cache bị skip).
    """
    global redis_client
    if not redis_url:
        print("[Cache] REDIS_URL không được đặt — bỏ qua cache, app vẫn chạy bình thường.")
        return
    try:
        import redis as redis_lib
        client = redis_lib.from_url(redis_url, decode_responses=True)
        client.ping()
        redis_client = client
        print(f"[Cache] Đã kết nối Redis: {redis_url}")
    except Exception as e:
        print(f"[Cache] Không kết nối được Redis ({e}) — chạy không có cache.")
