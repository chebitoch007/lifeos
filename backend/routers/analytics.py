from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models.habit import Habit
from models.quest import Quest, QuestStatus
from models.stat import UserStat
from models.user import User
from models.xp_event import XPEvent
from schemas.analytics import (
    QuestCompletionRate,
    StatDistributionItem,
    StreakSummary,
    XPDataPoint,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/xp-over-time", response_model=list[XPDataPoint])
async def xp_over_time(
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[XPDataPoint]:
    """Return daily XP totals for the last `days` days, filling gaps with 0."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(
            func.date(XPEvent.created_at).label("day"),
            func.sum(XPEvent.xp_amount).label("total_xp"),
        )
        .where(XPEvent.user_id == current_user.id, XPEvent.created_at >= since)
        .group_by(func.date(XPEvent.created_at))
        .order_by(func.date(XPEvent.created_at))
    )
    rows = {str(row.day): int(row.total_xp) for row in result}

    # Build full date range, filling gaps with 0
    output: list[XPDataPoint] = []
    for i in range(days):
        day = (datetime.now(timezone.utc) - timedelta(days=days - 1 - i)).date()
        day_str = str(day)
        output.append(XPDataPoint(date=day_str, xp=rows.get(day_str, 0)))

    return output


@router.get("/stat-distribution", response_model=list[StatDistributionItem])
async def stat_distribution(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[StatDistributionItem]:
    """Return all 6 stat current_values for the authenticated user."""
    result = await db.execute(
        select(UserStat).where(UserStat.user_id == current_user.id)
    )
    stats = result.scalars().all()
    return [
        StatDistributionItem(stat_name=s.stat_name.value, value=s.current_value)
        for s in stats
    ]


@router.get("/quest-completion-rate", response_model=QuestCompletionRate)
async def quest_completion_rate(
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestCompletionRate:
    """Count quests by status within the date range."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(Quest.status, func.count(Quest.id).label("cnt"))
        .where(Quest.user_id == current_user.id, Quest.created_at >= since)
        .group_by(Quest.status)
    )
    counts: dict[str, int] = {row.status.value: row.cnt for row in result}

    completed = counts.get("COMPLETED", 0)
    abandoned = counts.get("ABANDONED", 0)
    active = counts.get("ACTIVE", 0)
    total = completed + abandoned + active
    rate = completed / total if total > 0 else 0.0

    return QuestCompletionRate(
        total=total,
        completed=completed,
        abandoned=abandoned,
        completion_rate=round(rate, 4),
    )


@router.get("/streak-summary", response_model=StreakSummary)
async def streak_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreakSummary:
    """Aggregate streak stats across all user habits."""
    result = await db.execute(
        select(Habit).where(Habit.user_id == current_user.id)
    )
    habits = result.scalars().all()

    if not habits:
        return StreakSummary(longest_streak=0, current_streak=0, active_habits=0)

    longest = max(h.longest_streak for h in habits)
    current = max(h.current_streak for h in habits)
    return StreakSummary(
        longest_streak=longest,
        current_streak=current,
        active_habits=len(habits),
    )
