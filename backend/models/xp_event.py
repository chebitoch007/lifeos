import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from database import Base
from models.stat import StatName


class XPEvent(Base):
    __tablename__ = "xp_events"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_type: Mapped[str] = mapped_column(String(100), nullable=False)
    source_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    xp_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    stat_name: Mapped[StatName | None] = mapped_column(
        Enum(StatName, name="stat_name_enum"), nullable=True
    )
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # Intentionally no updated_at — this table is append-only
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
