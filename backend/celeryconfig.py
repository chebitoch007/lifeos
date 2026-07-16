from celery.schedules import crontab

beat_schedule = {
    "check-broken-streaks-daily": {
        "task": "tasks.habits.check_broken_streaks",
        "schedule": crontab(hour=0, minute=5),
    },
}

timezone = "UTC"
