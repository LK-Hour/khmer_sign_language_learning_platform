from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class FingerSpellingDatasetImage(Base):
    __tablename__ = "finger_spelling_dataset_images"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    letter: Mapped[str] = mapped_column(String(8), index=True)
    image_url: Mapped[str] = mapped_column(String(512))
    hand_landmarks_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_contribution_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("contributed_videos.id"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
