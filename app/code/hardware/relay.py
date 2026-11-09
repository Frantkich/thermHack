import time
from logging import log, DEBUG

def get_status():
    log(DEBUG, "Getting relay status")
    # TODO > Do GPIO logic
    status = "open"
    msg = "Done - simulation"
    return status, msg

def open():
    log(DEBUG, "Opening relay")
    # TODO > Do GPIO logic
    time.sleep(1)
    status = "open"
    msg = "Done - simulation"
    return status, msg

def close():
    log(DEBUG, "Closing relay")
    # TODO > Do GPIO logic
    time.sleep(1)
    status = "close"
    msg = "Done - simulation"
    return status, msg
