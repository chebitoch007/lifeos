import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models.quest import QuestStatus
from models.user import User
from schemas.quest import QuestCreate, QuestResponse
from services import quest_service

router = APIRouter(prefix="/api/quests", tags=["quests"])


@router.post("", response_model=QuestResponse, status_code=status.HTTP_201_CREATED)
async def create_quest(
    data: QuestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestResponse:
    quest = await quest_service.create_quest(db, current_user.id, data)
    return QuestResponse.model_validate(quest)


@router.get("", response_model=list[QuestResponse])
async def list_quests(
    quest_status: QuestStatus | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[QuestResponse]:
    quests = await quest_service.get_quests(db, current_user.id, quest_status)
    return [QuestResponse.model_validate(q) for q in quests]


@router.get("/{quest_id}", response_model=QuestResponse)
async def get_quest(
    quest_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestResponse:
    quest = await quest_service.get_quest(db, current_user.id, quest_id)
    return QuestResponse.model_validate(quest)


@router.post("/{quest_id}/complete", response_model=QuestResponse)
async def complete_quest(
    quest_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestResponse:
    quest = await quest_service.complete_quest(db, current_user.id, quest_id)
    return QuestResponse.model_validate(quest)


@router.post("/{quest_id}/abandon", response_model=QuestResponse)
async def abandon_quest(
    quest_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestResponse:
    quest = await quest_service.abandon_quest(db, current_user.id, quest_id)
    return QuestResponse.model_validate(quest)
