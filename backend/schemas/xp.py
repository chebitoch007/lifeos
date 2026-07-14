import uuid
from datetime import datetime

from pydantic import BaseModel

from models.stat import StatName


class XPEventResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: uuid.UUID
    source_type: str
    source_id: uuid.UUID | None
    xp_amount: int
    stat_name: StatName | None
    description: str | None
    created_at: datetime


class XPSummary(BaseModel):
    total_xp: int
    current_level: int
    xp_to_next_level: int
