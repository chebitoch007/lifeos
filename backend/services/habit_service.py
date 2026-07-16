"""
Habit service — streak logic lives here, never in the router or model.

Streak logic for DAILY habit (frequency_gap=1):
  Day 1 log  → last=None,       streak: None→1,     longest=1
  Day 2 log  → last=Day1,  gap=1==1,   streak: 1→2, longest=2
  Day 4 log  → last=Day2,  gap=2>1,    streak: 2→1 (reset)
  Day 5 log  → last=Day4,  gap=1==1,   streak: 1→2

Streak logic for WEEKLY habit (frequency_gap=7):
  Week 1 log → last=None,       streak: None→1,     longest=1
  Week 2 log → last=W1,   gap=7==7,   streak: 1→2
  Week 4 log → last=W2,   gap=14>7,   streak: 2→1 (reset)
"""
import uuid
from datetime import date, datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.habit import Habit, HabitFrequency, HabitLog
from models.stat import StatName
from schemas.habit import HabitCreate
from services import stat_service, xp_service
from services.achievement_service import check_and_award

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

FREQUENCY_GAP: dict[HabitFrequency, int] = {
    HabitFrequency.DAILY: 1,
    HabitFrequency.WEEKLY: 7,
}

XP_PER_LOG: dict[HabitFrequency, int] = {
    HabitFrequency.DAILY: 10,
    HabitFrequency.WEEKLY: 25,
}


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------


async def create_habit(
    db: AsyncSession,
    user_id: uuid.UUID,
    data: HabitCreate,
) -> Habit:
    habit = Habit(
        user_id=user_id,
        title=data.title,
        stat_name=data.stat_name,
        frequency=data.frequency,
        current_streak=0,
        longest_streak=0,
    )
    db.add(habit)
    await db.commit()
    await db.refresh(habit)
    return habit


async def get_habits(db: AsyncSession, user_id: uuid.UUID) -> list[Habit]:
    result = await db.execute(
        select(Habit)
        .where(Habit.user_id == user_id)
        .order_by(Habit.created_at.desc())
    )
    return list(result.scalars().all())


async def get_habit(
    db: AsyncSession,
    user_id: uuid.UUID,
    habit_id: uuid.UUID,
) -> Habit:
    result = await db.execute(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == user_id)
    )
    habit = result.scalar_one_or_none()
    if habit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found.")
    return habit


async def log_habit(
    db: AsyncSession,
    user_id: uuid.UUID,
    habit_id: uuid.UUID,
    log_date: date | None = None,
) -> tuple[Habit, HabitLog, bool]:
    """
    Log a habit completion. Returns (habit, log, is_new_record).
    is_new_record is True when current_streak just exceeded longest_streak.
    """
    # 1. Get the habit
    habit = await get_habit(db, user_id, habit_id)

    # 2. Resolve log date
    today: date = log_date or datetime.now(timezone.utc).date()

    # 3. Idempotent guard — 409 if already logged for this date
    existing = await db.execute(
        select(HabitLog).where(
            HabitLog.habit_id == habit_id,
            HabitLog.completed_date == today,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Habit already logged for {today}.",
        )

    # 4. Insert HabitLog row
    log = HabitLog(
        habit_id=habit_id,
        user_id=user_id,
        completed_date=today,
    )
    db.add(log)

    # 5 & 6. Update streak
    gap = FREQUENCY_GAP[habit.frequency]
    previous_longest = habit.longest_streak

    if habit.last_completed_date is None:
        habit.current_streak = 1
    else:
        days_since = (today - habit.last_completed_date).days
        if days_since == gap:
            habit.current_streak += 1
        elif days_since > gap:
            habit.current_streak = 1
        # days_since < gap (e.g. same day) is blocked by the 409 above

    if habit.current_streak > habit.longest_streak:
        habit.longest_streak = habit.current_streak

    # 7. Update last_completed_date
    habit.last_completed_date = today

    # 8. Award XP
    xp_amount = XP_PER_LOG[habit.frequency]
    await xp_service.award_xp(
        db,
        user_id=user_id,
        xp_amount=xp_amount,
        source_type="habit",
        source_id=habit.id,
        stat_name=StatName(habit.stat_name),
        description=f"Logged habit: {habit.title}",
    )

    # 9. Update related UserStat (+0.5 delta)
    await stat_service.update_stat(
        db,
        user_id=user_id,
        stat_name=StatName(habit.stat_name),
        delta=0.5,
    )

    # 10. Commit
    await db.flush()
    await db.commit()
    await db.refresh(habit)
    await db.refresh(log)

    # 11. Achievement checks (after commit so data is visible)
    await check_and_award(db, user_id)

    # 12. Return
    is_new_record = habit.current_streak > previous_longest
    return habit, log, is_new_record


async def get_habit_logs(
    db: AsyncSession,
    habit_id: uuid.UUID,
    user_id: uuid.UUID,
    limit: int = 30,
) -> list[HabitLog]:
    # Verify ownership
    await get_habit(db, user_id, habit_id)
    result = await db.execute(
        select(HabitLog)
        .where(HabitLog.habit_id == habit_id)
        .order_by(HabitLog.completed_date.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def delete_habit(
    db: AsyncSession,
    user_id: uuid.UUID,
    habit_id: uuid.UUID,
) -> None:
    habit = await get_habit(db, user_id, habit_id)
    await db.delete(habit)
    await db.commit()
