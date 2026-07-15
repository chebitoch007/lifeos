import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models.stat import StatName
from models.user import User
from schemas.stat import StatResponse, StatUpdate
from services import stat_service

router = APIRouter(prefix="/api/users", tags=["stats"])


@router.get("/{user_id}/stats", response_model=list[StatResponse])
async def get_stats(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[StatResponse]:
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You may only view your own stats.",
        )
    stats = await stat_service.get_stats(db, user_id)
    return [StatResponse.model_validate(s) for s in stats]


@router.patch("/{user_id}/stats/{stat_name}", response_model=StatResponse)
async def update_stat(
    user_id: uuid.UUID,
    stat_name: StatName,
    data: StatUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StatResponse:
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You may only update your own stats.",
        )
    stat = await stat_service.update_stat(db, user_id, stat_name, delta=data.current_value)
    return StatResponse.model_validate(stat)
