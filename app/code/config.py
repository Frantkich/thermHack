import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    
    # Database Configuration
    DB_NAME = os.getenv("MARIADB_DATABASE")
    DB_USER = os.getenv("MARIADB_USER")
    DB_PASSWORD = os.getenv("MARIADB_PASSWORD")
    DB_DNS = "db"
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_DNS}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=15)
    RATELIMIT_DEFAULT = "100/day"
    RATELIMIT_STORAGE_URL = "memory://"
