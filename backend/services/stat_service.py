import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.stat import StatName, UserStat


async def initialize_stats(db: AsyncSession, user_id: uuid.UUID) -> list[UserStat]:
    """Create one UserStat row per StatName, all starting at 0.
    Called automatically during user creation.
    """
    stats = [
        UserStat(user_id=user_id, stat_name=name, current_value=0.0)
        for name in StatName
    ]
    db.add_all(stats)
    await db.flush()
    return stats


async def get_stats(db: AsyncSession, user_id: uuid.UUID) -> list[UserStat]:
    result = await db.execute(
        select(UserStat).where(UserStat.user_id == user_id)
    )
    return list(result.scalars().all())


async def update_stat(
    db: AsyncSession,
    user_id: uuid.UUID,
    stat_name: StatName,
    delta: float,
) -> UserStat:
    """Add delta to the stat's current_value; floor at 0."""
    result = await db.execute(
        select(UserStat).where(
            UserStat.user_id == user_id,
            UserStat.stat_name == stat_name,
        )
    )
    stat: UserStat = result.scalar_one()
    stat.current_value = max(0.0, stat.current_value + delta)
    await db.flush()
    return stat
