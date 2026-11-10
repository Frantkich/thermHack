from logging import getLogger, basicConfig, DEBUG
from flask import Flask
from flask_talisman import Talisman

from config import Config
from db.db import db

from routes.front import front_bp, limiter
from routes.back import back_bp


app = Flask(__name__)
app.config.from_object(Config)

limiter.app = app

csp = {"default-src": "'self'", "script-src": ["'self'", "'unsafe-inline'"], "style-src": ["'self'", "'unsafe-inline'"]}
Talisman(app, force_https=False, content_security_policy=csp) 

db.init_app(app)

logger = getLogger(__name__)
basicConfig(level=DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")

app.register_blueprint(front_bp)
app.register_blueprint(back_bp)

with app.app_context():
    db.create_all()
