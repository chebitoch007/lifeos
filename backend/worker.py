from celery import Celery

from config import settings

celery_app = Celery(
    "lifeos",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["tasks.habits"],  # task modules will be added here in later phases
)

celery_app.config_from_object("celeryconfig")

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)
