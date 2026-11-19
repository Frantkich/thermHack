from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, timezone

from db import helpers as db_helpers
from tasks import helpers as tasks_helpers
from hardware import helpers as hw_helpers
from tools.decorators import token_required


back_bp = Blueprint("backend", __name__, url_prefix="/api")

@back_bp.route("/thermostat", methods=["GET"])
@token_required
def thermostat_status():
    try:
        status, msg = hw_helpers.thermostat_status()
        resp_code = 200
    except Exception as e:
        status = "failed"
        msg = str(e)
        resp_code = 500
    return jsonify({"status": status, "message": msg}), resp_code

@back_bp.route("/thermostat/<action>", methods=["POST"])
@token_required
def operateThermostat(action):
    if action not in ["on", "off"]:
        status = "error"
        msg = "Action invalid"
        resp_code = 400
    try:
        status, msg = hw_helpers.thermostat_controller(action)
        resp_code = 200
    except Exception as e:
        status = "failed"
        msg = str(e)
        resp_code = 500
    return jsonify({"status": status, "message": msg}), resp_code

@back_bp.route("/actionslogs", methods=["GET"])
@token_required
def get_action_logs():
    count = request.args.get("count") if "count" in request.args else 10
    try:
        action_logs = [{
            "timestamp": logs.timestamp,
            "status": logs.status,
            "ip_address": logs.ip_address, 
            "action": logs.action
        } for logs in db_helpers.get_logs(count)]
        status = "sucess"
        resp_code = 200
        return jsonify({"status": status, "data": action_logs}), resp_code

    except Exception as e:
        status = "failed"
        msg = str(e)
        resp_code = 500
        return jsonify({"status": status, "message": msg}), resp_code


@back_bp.route("/tasks", methods=["GET"])
@token_required
def get_tasks():
    return jsonify({
        "status": "sucess",
        "data": [{
            "id": task["id"],
            "name": task["name"],
            "day": task["date"].strftime("%a %m/%d"),
            "execution": task["date"].strftime("%H:%M")
        } for task in tasks_helpers.get_tasks() if task["date"] > datetime.now(timezone.utc)]
    }), 200


# REMOVE
@back_bp.route("/tasks", methods=["POST"])
@token_required
def add_task():
    tasks_helpers.add_task("on", datetime.now() + timedelta(days=-1))
    tasks_helpers.add_task("off", datetime.now() + timedelta(days=-1, hours=1))

    tasks_helpers.add_task("on", datetime.now() + timedelta(seconds=1700))
    tasks_helpers.add_task("off", datetime.now() + timedelta(seconds=3600))

    tasks_helpers.add_task("on", datetime.now() + timedelta(days=1))
    tasks_helpers.add_task("off", datetime.now() + timedelta(days=1, hours=1))

    
    tasks_helpers.add_task("on", datetime.now() + timedelta(days=2))
    
    tasks_helpers.add_task("off", datetime.now() + timedelta(days=3))

    return "tasks added", 200
