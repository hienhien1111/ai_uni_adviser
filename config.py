import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    DB_URI = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GROQ_API_KEY   = os.getenv("GROQ_API_KEY")
    GEMINI_MODEL   = "gemini-2.5-flash"
    GROQ_MODEL     = "groq/compound-mini"

    # Nếu không có Redis, REDIS_URL=None → cache bị skip, app vẫn chạy
    REDIS_URL = os.getenv("REDIS_URL", None)
    CACHE_TTL = 60 * 60 * 24   # 24 giờ

    ALLOWED_ORIGINS = [
        o.strip()
        for o in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if o.strip()
    ]

    # ── Rate limiting
    RATELIMIT_ANALYZE = "5 per minute"   # /api/analyze-personality (gọi AI)
    RATELIMIT_DEFAULT = "60 per minute"  # Các route khác
