from logging import log, DEBUG
from datetime import datetime
import uuid

from tasks.task import scheduler
# from hardware.helpers import thermostat_controller 

def thermostat_controller(action):
    log(DEBUG, f"Tasks executed > {action}")

def add_task(action, run_date:datetime):
    log(DEBUG, f"{action} : {run_date}")
    scheduler.add_job(
        func=thermostat_controller,
        trigger="date",
        run_date=run_date,
        args=[action],
        id=f"{run_date.year}{run_date.month}{run_date.day}-{uuid.uuid4()}",
        name=f"thermostat_{action}",
        misfire_grace_time=15,
        replace_existing=True)

def get_tasks():
    return [{
        "id": task.id,
        "name": task.name,
        "date": task.next_run_time
    } for task in scheduler.get_jobs()]
