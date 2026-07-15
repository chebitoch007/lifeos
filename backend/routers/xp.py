from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models.user import User
from schemas.xp import XPEventResponse, XPSummary
from services import xp_service

router = APIRouter(prefix="/api/users", tags=["xp"])


@router.get("/me/xp", response_model=XPSummary)
async def get_xp_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> XPSummary:
    return await xp_service.get_xp_summary(db, current_user.id)


@router.get("/me/xp/history", response_model=list[XPEventResponse])
async def get_xp_history(
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[XPEventResponse]:
    events = await xp_service.get_xp_history(db, current_user.id, limit)
    return [XPEventResponse.model_validate(e) for e in events]
