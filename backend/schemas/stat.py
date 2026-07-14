import uuid
from datetime import datetime

from pydantic import BaseModel

from models.stat import StatName


class StatResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: uuid.UUID
    stat_name: StatName
    current_value: float
    updated_at: datetime | None


class StatUpdate(BaseModel):
    current_value: float
