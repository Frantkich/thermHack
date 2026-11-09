from flask import request
from datetime import datetime

from db.db import db
from db.models import Log


def write_log(action:str, status:int, msg:str=None):
    log_entry = Log(
        timestamp=datetime.now(),
        ip_address=request.remote_addr,
        action=action,
        status=status,
        message=msg,
        user_agent=request.headers.get("User-Agent", "")[:255]
    )
    db.session.add(log_entry)
    return db.session.commit()

def get_recent_logs(limit) -> list[Log]:
    return Log.query.order_by(Log.timestamp.desc()).limit(limit).all()
