from logging import log, DEBUG

from db.helpers import write_log
from hardware import servo


def thermostat_status():
    log(DEBUG, f"Looking at thermostat status")
    status, msg = servo.get_status()
    match status:
        case "min":
            return "off", msg
        case "max":
            return "on", msg
        case _:
            return status, msg

def thermostat_controller(action:str):
    log(DEBUG, f"Thermostat -> {action}")
    match action:
        case "on":
            status, msg = servo.turn_max()
        case "off":
            status, msg = servo.turn_min()
        case _:
            status, msg = "failed", "Requested action not found !"
            
    match status:
        case "min":
            status = "off"
        case "max":
            status = "on"
        
    write_log(action, status, msg)
    
    return status, msg
