"""
Celery task for daily streak maintenance.

Runs once per day (scheduling via Celery Beat is a Phase 10 concern).
Can be triggered manually: celery -A worker.celery_app call tasks.habits.check_broken_streaks
"""
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select

from database import AsyncSessionLocal
from models.habit import Habit, HabitFrequency
from worker import celery_app

# Mirrors FREQUENCY_GAP in habit_service — defined independently so the task
# has no runtime dependency on the FastAPI service layer.
_FREQUENCY_GAP: dict[str, int] = {
    HabitFrequency.DAILY.value: 1,
    HabitFrequency.WEEKLY.value: 7,
}


@celery_app.task(name="tasks.habits.check_broken_streaks")
def check_broken_streaks() -> dict:
    """
    Reset current_streak to 0 for any habit where:
      - current_streak > 0
      - last_completed_date is not None
      - days since last_completed_date > frequency_gap

    Uses its own DB session — never shares the FastAPI request session.
    Returns {"reset_count": n} for observability.
    """
    import asyncio

    return asyncio.run(_async_check_broken_streaks())


async def _async_check_broken_streaks() -> dict:
    today: date = datetime.now(timezone.utc).date()
    reset_count = 0

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Habit).where(
                Habit.current_streak > 0,
                Habit.last_completed_date.is_not(None),
            )
        )
        habits = result.scalars().all()

        for habit in habits:
            if habit.last_completed_date is None:
                continue
            gap = _FREQUENCY_GAP.get(habit.frequency.value, 1)
            days_since = (today - habit.last_completed_date).days
            if days_since > gap:
                habit.current_streak = 0
                reset_count += 1

        if reset_count > 0:
            await db.commit()

    return {"reset_count": reset_count}
