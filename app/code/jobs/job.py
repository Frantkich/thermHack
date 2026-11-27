from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore

from config import Config


scheduler = BackgroundScheduler(jobstores={'default': SQLAlchemyJobStore(url=Config.SQLALCHEMY_DATABASE_URI)})
