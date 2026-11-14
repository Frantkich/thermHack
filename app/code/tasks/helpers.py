from logging import log, DEBUG
import uuid

from tasks.task import scheduler
# from hardware.helpers import thermostat_controller 

def thermostat_controller(action):
    log(DEBUG, f"Tasks executed > {action}")

def create_thermostat_task(action, run_date):
    log(DEBUG, f"{action} : {run_date}")
    scheduler.add_job(
        func=thermostat_controller,
        trigger="date",
        run_date=run_date,
        args=[action],
        id=uuid.uuid4(),
        name="operate_thermostat",
        misfire_grace_time=15,
        replace_existing=True)

