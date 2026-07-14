import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None


class UserUpdate(BaseModel):
    display_name: str | None = None
    avatar_url: str | None = None


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: str
    display_name: str | None
    avatar_url: str | None
    current_level: int
    total_xp: int
    created_at: datetime
