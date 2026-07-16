import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from logger import get_logger
from models.quest import Quest, QuestStatus
from models.stat import StatName
from schemas.quest import QuestCreate
from services import stat_service, xp_service
from services.achievement_service import check_and_award

logger = get_logger(__name__)


async def create_quest(
    db: AsyncSession,
    user_id: uuid.UUID,
    data: QuestCreate,
) -> Quest:
    quest = Quest(
        user_id=user_id,
        title=data.title,
        description=data.description,
        stat_name=data.stat_name,
        xp_reward=data.xp_reward,
        difficulty=data.difficulty,
        due_date=data.due_date,
        status=QuestStatus.ACTIVE,
    )
    db.add(quest)
    await db.commit()
    await db.refresh(quest)
    return quest


async def get_quests(
    db: AsyncSession,
    user_id: uuid.UUID,
    quest_status: QuestStatus | None = None,
) -> list[Quest]:
    stmt = select(Quest).where(Quest.user_id == user_id)
    if quest_status is not None:
        stmt = stmt.where(Quest.status == quest_status)
    stmt = stmt.order_by(Quest.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_quest(
    db: AsyncSession,
    user_id: uuid.UUID,
    quest_id: uuid.UUID,
) -> Quest:
    result = await db.execute(
        select(Quest).where(Quest.id == quest_id, Quest.user_id == user_id)
    )
    quest = result.scalar_one_or_none()
    if quest is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found.")
    return quest


async def complete_quest(
    db: AsyncSession,
    user_id: uuid.UUID,
    quest_id: uuid.UUID,
) -> Quest:
    quest = await get_quest(db, user_id, quest_id)

    if quest.status in (QuestStatus.COMPLETED, QuestStatus.ABANDONED):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Quest is already {quest.status.value.lower()}.",
        )

    quest.status = QuestStatus.COMPLETED
    quest.completed_at = datetime.now(timezone.utc)
    await db.flush()

    await xp_service.award_xp(
        db,
        user_id=user_id,
        xp_amount=quest.xp_reward,
        source_type="quest",
        source_id=quest.id,
        stat_name=quest.stat_name,
        description=f"Completed quest: {quest.title}",
    )

    await stat_service.update_stat(
        db,
        user_id=user_id,
        stat_name=StatName(quest.stat_name),
        delta=1.0,
    )

    logger.info(
        "quest_completed user=%s quest=%s xp=%s",
        user_id, quest_id, quest.xp_reward,
    )

    await db.commit()
    await db.refresh(quest)

    # Check and award achievements after quest data is committed
    await check_and_award(db, user_id)

    return quest


async def abandon_quest(
    db: AsyncSession,
    user_id: uuid.UUID,
    quest_id: uuid.UUID,
) -> Quest:
    quest = await get_quest(db, user_id, quest_id)

    if quest.status in (QuestStatus.COMPLETED, QuestStatus.ABANDONED):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Quest is already {quest.status.value.lower()}.",
        )

    quest.status = QuestStatus.ABANDONED
    await db.commit()
    await db.refresh(quest)
    return quest
