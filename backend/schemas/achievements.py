import uuid
from datetime import datetime

from pydantic import BaseModel


class AchievementResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    key: str
    title: str
    description: str
    xp_bonus: int
    icon: str


class UserAchievementResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    achievement: AchievementResponse
    earned_at: datetime
