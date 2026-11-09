from datetime import datetime

from db.db import db

class Token(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hashed_token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.now())

class Log(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.now(), nullable=False, index=True)
    ip_address = db.Column(db.String(45), nullable=False)
    action = db.Column(db.String(16), nullable=False)
    status = db.Column(db.String(16), nullable=False)
    message = db.Column(db.Text, nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
