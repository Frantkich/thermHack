import os
from gpiozero import OutputDevice
from logging import log, DEBUG

class RelayController():
    def __init__(self):
        self.relay = OutputDevice(os.getenv("CRTL_PIN"), active_high=False, initial_value=True)
    
    def status(self) -> tuple[str, str]:
        log(DEBUG, "Getting relay status")
        try:
            match self.relay.is_active:
                case True:
                    status = "off"
                    msg = "ok"
                case False:
                    status = "on"
                    msg = "ok"
                case _:
                    status = "failed"
                    msg = "Unkowned relay state"
        except Exception:
            status = "failed"
            msg     = "Cannot get relay status. Connection might be broken."
        return status, msg

    def open(self):
        log(DEBUG, "Opening relay")
        self.relay.on()
        return self.status()

    def close(self):
        log(DEBUG, "Closing relay")
        self.relay.off()
        return self.status()
