import uuid
from datetime import date, datetime

from pydantic import BaseModel

from models.habit import HabitFrequency
from models.stat import StatName


class HabitCreate(BaseModel):
    title: str
    stat_name: StatName
    frequency: HabitFrequency


class HabitResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    stat_name: StatName
    frequency: HabitFrequency
    current_streak: int
    longest_streak: int
    last_completed_date: date | None
    created_at: datetime


class HabitLogResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    habit_id: uuid.UUID
    user_id: uuid.UUID
    completed_date: date
    created_at: datetime
