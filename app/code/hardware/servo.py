import time
from logging import log, DEBUG

def get_status():
    log(DEBUG, "Getting servo orientation")
    status = "min"
    msg = "Done - simulation"
    return status, msg

def turn_min():
    log(DEBUG, "Turning servo to minimum")
    time.sleep(1)
    status = "min"
    msg = "Done - simulation"
    return status, msg

def turn_max():
    log(DEBUG, "Turning servo to maximum")
    time.sleep(1)
    status = "max"
    msg = "Done - simulation"
    return status, msg
