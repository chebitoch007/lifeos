import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas.xp import XPEventResponse, XPSummary
from services import xp_service

router = APIRouter(prefix="/api/users", tags=["xp"])


@router.get("/{user_id}/xp", response_model=XPSummary)
async def get_xp_summary(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> XPSummary:
    return await xp_service.get_xp_summary(db, user_id)


@router.get("/{user_id}/xp/history", response_model=list[XPEventResponse])
async def get_xp_history(
    user_id: uuid.UUID,
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> list[XPEventResponse]:
    events = await xp_service.get_xp_history(db, user_id, limit)
    return [XPEventResponse.model_validate(e) for e in events]
