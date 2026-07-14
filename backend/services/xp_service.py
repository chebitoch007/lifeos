import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.stat import StatName
from models.user import User
from models.xp_event import XPEvent
from schemas.xp import XPSummary

# ---------------------------------------------------------------------------
# XP curve — pure function, no DB
# ---------------------------------------------------------------------------

_LEVEL_THRESHOLDS: list[int] = [0, 100, 250, 500, 900]


def recalculate_level(total_xp: int) -> int:
    """Return the highest level reached for the given total XP.

    Levels 1-5 use fixed thresholds; level 6+ each cost (level * 300) XP
    on top of the previous threshold.
    """
    thresholds = list(_LEVEL_THRESHOLDS)  # copy so we can extend
    level = 1
    for i, threshold in enumerate(thresholds):
        if total_xp >= threshold:
            level = i + 1
        else:
            return level

    # Level 6+ — extend curve until total_xp is exceeded
    next_level = len(thresholds) + 1  # starts at 6
    accumulated = thresholds[-1]
    while True:
        accumulated += next_level * 300
        if total_xp >= accumulated:
            level = next_level
            next_level += 1
        else:
            return level


def _xp_for_next_level(current_level: int) -> int:
    """Return the total XP required to reach current_level + 1."""
    if current_level < len(_LEVEL_THRESHOLDS):
        return _LEVEL_THRESHOLDS[current_level]  # index = level (1-based offset)
    # Level 6+
    accumulated = _LEVEL_THRESHOLDS[-1]
    for lvl in range(len(_LEVEL_THRESHOLDS) + 1, current_level + 2):
        accumulated += lvl * 300
    return accumulated


# ---------------------------------------------------------------------------
# DB operations
# ---------------------------------------------------------------------------


async def award_xp(
    db: AsyncSession,
    user_id: uuid.UUID,
    xp_amount: int,
    source_type: str,
    source_id: uuid.UUID | None = None,
    stat_name: StatName | None = None,
    description: str | None = None,
) -> XPEvent:
    """Append an XPEvent, update user.total_xp, and recalculate level."""
    event = XPEvent(
        user_id=user_id,
        source_type=source_type,
        source_id=source_id,
        xp_amount=xp_amount,
        stat_name=stat_name,
        description=description,
        created_at=datetime.now(timezone.utc),
    )
    db.add(event)

    result = await db.execute(select(User).where(User.id == user_id))
    user: User = result.scalar_one()
    user.total_xp += xp_amount
    user.current_level = recalculate_level(user.total_xp)

    await db.flush()
    return event


async def get_xp_history(
    db: AsyncSession,
    user_id: uuid.UUID,
    limit: int = 50,
) -> list[XPEvent]:
    result = await db.execute(
        select(XPEvent)
        .where(XPEvent.user_id == user_id)
        .order_by(XPEvent.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_xp_summary(db: AsyncSession, user_id: uuid.UUID) -> XPSummary:
    result = await db.execute(select(User).where(User.id == user_id))
    user: User = result.scalar_one()
    xp_to_next = _xp_for_next_level(user.current_level) - user.total_xp
    return XPSummary(
        total_xp=user.total_xp,
        current_level=user.current_level,
        xp_to_next_level=max(0, xp_to_next),
    )
