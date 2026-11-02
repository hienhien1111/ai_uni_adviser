"""
cache_service.py — Redis cache helpers.

Tất cả hàm đều gracefully degrade: nếu Redis không kết nối được,
chúng trả về None (get) hoặc im lặng (set), không làm crash app.
"""
import hashlib


def make_key(prefix: str, text: str) -> str:
    """Tạo cache key ngắn gọn từ prefix + SHA-256 của text."""
    h = hashlib.sha256(text.encode("utf-8")).hexdigest()[:24]
    return f"{prefix}:{h}"


def get_cached(key: str) -> str | None:
    """Lấy giá trị từ Redis. Trả về None nếu miss hoặc Redis không khả dụng."""
    from extensions import redis_client
    if redis_client is None:
        return None
    try:
        return redis_client.get(key)
    except Exception as e:
        print(f"[Cache] get_cached error: {e}")
        return None


def set_cached(key: str, value: str, ttl: int | None = None) -> None:
    """Lưu giá trị vào Redis với TTL (giây). Im lặng nếu Redis không khả dụng."""
    from extensions import redis_client
    from config import Config
    if redis_client is None:
        return
    ttl = ttl if ttl is not None else Config.CACHE_TTL
    try:
        redis_client.setex(key, ttl, value)
    except Exception as e:
        print(f"[Cache] set_cached error: {e}")
