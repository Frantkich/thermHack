from logging import log, DEBUG

from db.helpers import write_log
from hardware import relay


def thermostat_status():
    log(DEBUG, f"Looking at thermostat status")
    status, msg = relay.get_status()
    status = translate_state(status)
    return status, msg

def thermostat_controller(action:str):
    log(DEBUG, f"Thermostat -> {action}")
    match action:
        case "on":
            status, msg = relay.close()
        case "off":
            status, msg = relay.open()
        case _:
            status, msg = "failed", "Requested action not found !"
    status = translate_state(status)
    write_log(action, status, msg)
    
    return status, msg

def translate_state(status):
    match status:
        case "open":
            return "off"
        case "close":
            return "on"
        case _:
            return status
