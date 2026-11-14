from functools import wraps
from flask import request, redirect, url_for

from tools.token import check_token_valid

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get("auth_token")        

        if not token:
            return redirect(url_for("frontend.login"))

        if not check_token_valid(token):
            return redirect(url_for("frontend.logout"))
            
        return f(*args, **kwargs)
    return decorated_function
