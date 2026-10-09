import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from config import Config
from extensions import db, limiter, init_redis
import models
from routes import register_blueprints

load_dotenv()

app = Flask(__name__)
app.json.ensure_ascii = False

app.config['SQLALCHEMY_DATABASE_URI']        = Config.DB_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = Config.SQLALCHEMY_TRACK_MODIFICATIONS
import re as _re

_cors_origins = Config.ALLOWED_ORIGINS
if not _cors_origins or _cors_origins == ['http://localhost:5173', 'http://127.0.0.1:5173']:
    _cors_origins = _re.compile(r"http://(localhost|127\.0\.0\.1):\d+")

CORS(app, origins=_cors_origins)

app.config['RATELIMIT_STORAGE_URI'] = os.getenv('RATELIMIT_STORAGE_URI', 'memory://')
limiter.init_app(app)

db.init_app(app)
init_redis(Config.REDIS_URL)
register_blueprints(app)

if __name__ == '__main__':
    app.run(debug=True, port=5000)