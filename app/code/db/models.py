from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from db.db import db

class Token(db.Model):
    id = Column(Integer, primary_key=True)
    hashed_token = Column(String(255), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now())

class Log(db.Model):
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.now(), nullable=False, index=True)
    ip_address = Column(String(45), nullable=False)
    action = Column(String(16), nullable=False)
    status = Column(String(16), nullable=False)
    message = Column(Text, nullable=True)
    user_agent = Column(String(255), nullable=True)
