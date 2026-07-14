import uuid
from datetime import datetime

from pydantic import BaseModel

from models.quest import QuestDifficulty, QuestStatus
from models.stat import StatName


class QuestCreate(BaseModel):
    title: str
    description: str | None = None
    stat_name: StatName
    xp_reward: int
    difficulty: QuestDifficulty
    due_date: datetime | None = None


class QuestUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    due_date: datetime | None = None


class QuestResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: str | None
    stat_name: StatName
    xp_reward: int
    difficulty: QuestDifficulty
    status: QuestStatus
    due_date: datetime | None
    completed_at: datetime | None
    created_at: datetime
