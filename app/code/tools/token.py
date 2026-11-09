import os, hmac, hashlib, uuid

from db.models import Token


SECRET=os.getenv("SECRET_KEY").encode()

def hash_token(token:str):
    return hmac.new(SECRET, token.encode(), hashlib.sha256).hexdigest()

def check_token_valid(token:str):
    hashed_token = hash_token(token)
    return Token.query.filter_by(hashed_token=hashed_token, is_active=True).first()

def create_token():
    return uuid.uuid4()
