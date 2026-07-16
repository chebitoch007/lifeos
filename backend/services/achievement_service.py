from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.achievement import Achievement, UserAchievement
from models.habit import Habit
from models.quest import Quest, QuestStatus
from models.stat import UserStat
from models.user import User
from services import xp_service


# ---------------------------------------------------------------------------
# Private check helpers — each returns a set of achievement keys earned
# ---------------------------------------------------------------------------


async def _check_quest_count(db: AsyncSession, user_id: uuid.UUID) -> set[str]:
    result = await db.execute(
        select(func.count(Quest.id)).where(
            Quest.user_id == user_id,
            Quest.status == QuestStatus.COMPLETED,
        )
    )
    count: int = result.scalar_one()
    earned: set[str] = set()
    if count >= 1:
        earned.add("first_quest")
    if count >= 10:
        earned.add("quest_10")
    if count >= 50:
        earned.add("quest_50")
    return earned


def _check_xp_thresholds(user: User) -> set[str]:
    earned: set[str] = set()
    if user.total_xp >= 100:
        earned.add("xp_100")
    if user.total_xp >= 1000:
        earned.add("xp_1000")
    if user.total_xp >= 10000:
        earned.add("xp_10000")
    return earned


def _check_level_thresholds(user: User) -> set[str]:
    earned: set[str] = set()
    if user.current_level >= 5:
        earned.add("level_5")
    if user.current_level >= 10:
        earned.add("level_10")
    return earned


async def _check_streaks(db: AsyncSession, user_id: uuid.UUID) -> set[str]:
    result = await db.execute(
        select(func.max(Habit.longest_streak)).where(Habit.user_id == user_id)
    )
    max_streak: int = result.scalar_one() or 0
    earned: set[str] = set()
    if max_streak >= 7:
        earned.add("streak_7")
    if max_streak >= 30:
        earned.add("streak_30")
    return earned


async def _check_all_stats(db: AsyncSession, user_id: uuid.UUID) -> set[str]:
    result = await db.execute(
        select(UserStat).where(UserStat.user_id == user_id)
    )
    stats = result.scalars().all()
    if len(stats) == 6 and all(s.current_value >= 10 for s in stats):
        return {"all_stats"}
    return set()


async def _check_habit_count(db: AsyncSession, user_id: uuid.UUID) -> set[str]:
    result = await db.execute(
        select(func.count(Habit.id)).where(Habit.user_id == user_id)
    )
    count: int = result.scalar_one()
    return {"first_habit"} if count >= 1 else set()


# ---------------------------------------------------------------------------
# Main check-and-award function
# ---------------------------------------------------------------------------


async def check_and_award(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> list[UserAchievement]:
    """
    Check all achievements for user_id and award any newly unlocked ones.
    Idempotent — calling twice never double-awards.
    All writes happen in a single transaction (caller commits).
    Returns the list of newly awarded UserAchievement rows.
    """
    # 1. Load user for XP / level checks
    user_result = await db.execute(select(User).where(User.id == user_id))
    user: User = user_result.scalar_one()

    # 2. All achievement definitions
    all_achievements_result = await db.execute(select(Achievement))
    all_achievements = {a.key: a for a in all_achievements_result.scalars().all()}

    # 3. Already-earned achievement IDs
    earned_result = await db.execute(
        select(UserAchievement.achievement_id).where(
            UserAchievement.user_id == user_id
        )
    )
    already_earned_ids: set[uuid.UUID] = {row[0] for row in earned_result}

    # 4. Run all checks and union the earned keys
    earned_keys: set[str] = set()
    earned_keys |= await _check_quest_count(db, user_id)
    earned_keys |= _check_xp_thresholds(user)
    earned_keys |= _check_level_thresholds(user)
    earned_keys |= await _check_streaks(db, user_id)
    earned_keys |= await _check_all_stats(db, user_id)
    earned_keys |= await _check_habit_count(db, user_id)

    # 5. Award newly unlocked achievements
    newly_awarded: list[UserAchievement] = []
    now = datetime.now(timezone.utc)

    for key in earned_keys:
        achievement = all_achievements.get(key)
        if achievement is None:
            continue  # key not yet seeded — skip gracefully
        if achievement.id in already_earned_ids:
            continue  # already earned — skip

        ua = UserAchievement(
            user_id=user_id,
            achievement_id=achievement.id,
            earned_at=now,
        )
        db.add(ua)
        already_earned_ids.add(achievement.id)  # prevent dupes within this call

        # Award XP bonus (flush before award so user row is fresh)
        await db.flush()
        await xp_service.award_xp(
            db,
            user_id=user_id,
            xp_amount=achievement.xp_bonus,
            source_type="achievement",
            source_id=achievement.id,
            stat_name=None,
            description=f"Achievement unlocked: {achievement.title}",
        )

        newly_awarded.append(ua)

    # 6. Single commit at end
    await db.commit()

    # Refresh to populate relationships for response serialization
    for ua in newly_awarded:
        await db.refresh(ua)

    return newly_awarded
