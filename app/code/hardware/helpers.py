from logging import log, DEBUG

from db.helpers import write_log
from hardware.relay import RelayController

relay = RelayController()

def thermostat_status():
    return relay.status()

def thermostat_controller(action:str):
    match action:
        case "on":
            status, msg = relay.close()
        case "off":
            status, msg = relay.open()
        case _:
            status, msg = "failed", "Requested action not found !"
    write_log(action, status, msg)
    
    return status, msg
