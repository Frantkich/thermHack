from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, timezone

from db import helpers as db_helpers
from jobs import helpers as jobs_helpers
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

@back_bp.route("/logs", methods=["GET"])
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


@back_bp.route("/jobs", methods=["GET"])
@token_required
def get_jobs():
    today_date = datetime.now(timezone.utc)
    today_day_start = datetime(today_date.year, today_date.month, today_date.day, tzinfo=timezone.utc)
    return jsonify({
        "status": "sucess",
        "data": [{
            "id": job["id"],
            "name": job["name"],
            "day": job["date"].strftime("%a %d/%m"),
            "execution": job["date"].strftime("%H:%M")
        } for job in jobs_helpers.get_jobs() if job["date"] > today_day_start]
    }), 200


@back_bp.route("/jobs", methods=["PATCH"])
@token_required
def edit_jobs():
    results = []
    for job in request.json:
        job_id = job["id"]
        if job["execution_hour"]:
            job_date = datetime(
                year=int(job_id[0:4]),
                month=int(job_id[4:6]),
                day=int(job_id[6:8]),
                hour=int(job["execution_hour"][0:2]),
                minute=int(job["execution_hour"][3:5]),
            )
            results.append(jobs_helpers.edit_job(job_id, job_date))
        else:
            results.append(jobs_helpers.cancel_job(job_id))

    if results.count("ok") == len(request.json):
        return jsonify({"status": "ok"}), 200
    else:
        return jsonify({"status": "failed"}), 500


# REMOVE
@back_bp.route("/jobs", methods=["POST"])
@token_required
def add_job():
    jobs_helpers.add_job("on", datetime.now() + timedelta(days=-1))
    jobs_helpers.add_job("off", datetime.now() + timedelta(days=-1, hours=1))

    jobs_helpers.add_job("on", datetime.now() + timedelta(seconds=1700))
    jobs_helpers.add_job("off", datetime.now() + timedelta(seconds=3600))

    jobs_helpers.add_job("on", datetime.now() + timedelta(days=1))
    jobs_helpers.add_job("off", datetime.now() + timedelta(days=1, hours=1))

    
    jobs_helpers.add_job("on", datetime.now() + timedelta(days=2))
    
    jobs_helpers.add_job("off", datetime.now() + timedelta(days=3))

    return "jobs added", 200
