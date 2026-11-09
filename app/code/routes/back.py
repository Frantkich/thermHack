from flask import Blueprint, request, jsonify

from db.helpers import get_recent_logs
from tools.decorators import token_required
from hardware.controller import thermostat_status, thermostat_controller


back_bp = Blueprint("backend", __name__, url_prefix="/api")

@back_bp.route("/thermostat", methods=["GET"])
@token_required
def getThermostatStatus():
    try:
        status, msg = thermostat_status()
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
        status, msg = thermostat_controller(action)
        resp_code = 200
    except Exception as e:
        status = "failed"
        msg = str(e)
        resp_code = 500
    return jsonify({"status": status, "message": msg}), resp_code

@back_bp.route("/actions", methods=["GET"])
@token_required
def getActionLogs():
    count = request.args.get("count") if "count" in request.args else 10
    try:
        action_logs = [{
            "timestamp": al.timestamp,
            "status": al.status,
            "ip_address": al.ip_address, 
            "action": al.action
        } for al in get_recent_logs(count)]
        status = "sucess"
        resp_code = 200
        return jsonify({"status": status, "data": action_logs}), resp_code

    except Exception as e:
        status = "failed"
        msg = str(e)
        resp_code = 500
        return jsonify({"status": status, "message": msg}), resp_code
