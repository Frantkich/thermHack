from logging import log, DEBUG
from datetime import datetime
import uuid

from jobs.job import scheduler
from hardware.helpers import thermostat_controller 

def add_job(action, run_date:datetime):
    log(DEBUG, f"{action} : {run_date}")
    scheduler.add_job(
        func=thermostat_controller,
        trigger="date",
        run_date=run_date,
        args=[action],
        id=f"{run_date.year}{run_date.month}{run_date.day}-{uuid.uuid4()}",
        name=f"thermostat_{action}",
        misfire_grace_time=15,
        replace_existing=True
    )

def get_jobs():
    log(DEBUG, "Getting job list")
    return [{
        "id": job.id,
        "name": job.name,
        "date": job.next_run_time
    } for job in scheduler.get_jobs()]


def edit_job(id, run_date):
    log(DEBUG, f"Changing job execution date {id} > {run_date}")
    try:
        scheduler.reschedule_job(id, trigger="date", run_date=run_date)
        return "ok"
    except Exception as e:
         return "failed"

def cancel_job(id):
    log(DEBUG, f"Canceling job {id}")
    try:
        scheduler.remove_job(id)
        return "ok"
    except Exception as e:
         return "failed"

    
