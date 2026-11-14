from logging import log, DEBUG
from datetime import datetime

from tasks.task import scheduler


def operate_thermostat(action):
    log(DEBUG, action)
    with open("result.txt", "w+") as f:
        f.write(str(datetime.now()))

def create_thermostat_task(action, run_date):
    log(DEBUG, f"{action} : {run_date}")
    scheduler.add_job(func=operate_thermostat, trigger="date", run_date=run_date, args=[action])
