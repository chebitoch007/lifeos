import uuid
from datetime import date

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models.user import User
from schemas.habit import HabitCreate, HabitLogResponse, HabitResponse
from services import habit_service

router = APIRouter(prefix="/api/habits", tags=["habits"])


class LogHabitBody(BaseModel):
    log_date: date | None = None


@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(
    data: HabitCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HabitResponse:
    habit = await habit_service.create_habit(db, current_user.id, data)
    return HabitResponse.model_validate(habit)


@router.get("", response_model=list[HabitResponse])
async def list_habits(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[HabitResponse]:
    habits = await habit_service.get_habits(db, current_user.id)
    return [HabitResponse.model_validate(h) for h in habits]


@router.get("/{habit_id}", response_model=HabitResponse)
async def get_habit(
    habit_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HabitResponse:
    habit = await habit_service.get_habit(db, current_user.id, habit_id)
    return HabitResponse.model_validate(habit)


@router.post("/{habit_id}/log", response_model=HabitLogResponse)
async def log_habit(
    habit_id: uuid.UUID,
    body: LogHabitBody = LogHabitBody(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HabitLogResponse:
    _, log, _ = await habit_service.log_habit(
        db, current_user.id, habit_id, body.log_date
    )
    return HabitLogResponse.model_validate(log)


@router.get("/{habit_id}/logs", response_model=list[HabitLogResponse])
async def get_habit_logs(
    habit_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[HabitLogResponse]:
    logs = await habit_service.get_habit_logs(db, current_user.id, habit_id)
    return [HabitLogResponse.model_validate(log) for log in logs]


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    await habit_service.delete_habit(db, current_user.id, habit_id)
