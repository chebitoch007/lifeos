import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from database import Base


class StatName(str, enum.Enum):
    FITNESS = "FITNESS"
    CODING = "CODING"
    LEARNING = "LEARNING"
    FINANCES = "FINANCES"
    COMMUNICATION = "COMMUNICATION"
    DISCIPLINE = "DISCIPLINE"


class UserStat(Base):
    __tablename__ = "user_stats"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    stat_name: Mapped[StatName] = mapped_column(
        Enum(StatName, name="stat_name_enum"), nullable=False
    )
    current_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=func.now()
    )
