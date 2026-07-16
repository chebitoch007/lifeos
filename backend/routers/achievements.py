from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models.achievement import Achievement, UserAchievement
from models.user import User
from schemas.achievements import AchievementResponse, UserAchievementResponse
from services.achievement_service import check_and_award

router = APIRouter(tags=["achievements"])


@router.get("/api/achievements", response_model=list[AchievementResponse])
async def list_achievements(
    db: AsyncSession = Depends(get_db),
) -> list[AchievementResponse]:
    """Return all achievement definitions — public, no auth required."""
    result = await db.execute(select(Achievement).order_by(Achievement.xp_bonus))
    achievements = result.scalars().all()
    return [AchievementResponse.model_validate(a) for a in achievements]


@router.get("/api/users/me/achievements", response_model=list[UserAchievementResponse])
async def my_achievements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[UserAchievementResponse]:
    """Return the authenticated user's earned achievements — single query via joinedload."""
    result = await db.execute(
        select(UserAchievement)
        .options(joinedload(UserAchievement.achievement))
        .where(UserAchievement.user_id == current_user.id)
        .order_by(UserAchievement.earned_at.desc())
    )
    user_achievements = result.scalars().all()

    return [
        UserAchievementResponse(
            id=ua.id,
            achievement=AchievementResponse.model_validate(ua.achievement),
            earned_at=ua.earned_at,
        )
        for ua in user_achievements
    ]


@router.post("/api/users/me/achievements/check", response_model=list[UserAchievementResponse])
async def check_achievements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[UserAchievementResponse]:
    """Manually trigger achievement check for current user. Returns newly awarded."""
    newly_awarded = await check_and_award(db, current_user.id)

    responses = []
    for ua in newly_awarded:
        result = await db.execute(
            select(Achievement).where(Achievement.id == ua.achievement_id)
        )
        ach = result.scalar_one()
        responses.append(
            UserAchievementResponse(
                id=ua.id,
                achievement=AchievementResponse.model_validate(ach),
                earned_at=ua.earned_at,
            )
        )
    return responses
