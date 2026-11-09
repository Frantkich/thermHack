import os
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, make_response
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from db.db import db
from db.models import Log, Token
from tools.token import hash_token, check_token_valid
from tools.decorators import token_required


front_bp = Blueprint("frontend", __name__,)

limiter = Limiter(key_func=get_remote_address, default_limits=["100 per minute"], storage_uri="memory://")

@front_bp.route("/")
def index():
    return redirect(url_for("frontend.dashboard"))

@limiter.limit("5 per minute")
@front_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.cookies.get("auth_token"):
        return redirect(url_for("frontend.dashboard"))

    if request.method == "POST":
        provided_token = request.form.get("token")
        if not provided_token:
            flash("Token missing !", "danger")
            return render_template("login.html")
        
        if check_token_valid(provided_token):
            resp = make_response(redirect(url_for("frontend.dashboard")))
            resp.set_cookie(
                "auth_token", 
                provided_token, 
                httponly=True, 
                secure=True, 
                samesite="Strict", 
                max_age=604800 # 7d
            )
            return resp
        else:
            flash("Invalid token", "danger")
    return render_template("login.html")

@front_bp.route("/logout")
def logout():
    resp = make_response(redirect(url_for("frontend.login")))
    resp.delete_cookie("auth_token")
    return resp

@front_bp.route("/dashboard")
@token_required
def dashboard():
    return render_template("dashboard.html")

@front_bp.route("/api/logs")
@token_required
def get_all_logs():
    logs = Log.query.order_by(Log.timestamp.desc()).limit(100).all()
    return jsonify([{
        "timestamp": l.timestamp.isoformat(),
        "ip": l.ip_address,
        "action": l.action,
        "status": l.status,
        "error": l.error_message
    } for l in logs])

@front_bp.route("/setup-token", methods=["POST"])
def setup_initial_token():
    if os.environ.get("INIT_SECRET") != "CHANGE_ME_NOW":
        return jsonify({"error": "Unauthorized"}), 403
        
    new_token = request.form.get("token")
    if not new_token or len(new_token) < 16:
        return jsonify({"error": "Token trop court"}), 400

    hashed_token = hash_token(new_token)
    # Deactivate old tokens
    Token.query.update({"is_active": False})
    
    new_token = Token(hashed_token=hashed_token, is_active=True)
    db.session.add(new_token)
    db.session.commit()
    
    return jsonify({"message": "New token created, old ones deactivated. Remove INIT_SECRET now !"})
