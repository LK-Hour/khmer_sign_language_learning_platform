from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SignLanguageDatasetVideo(Base):
    __tablename__ = "sign_language_dataset_videos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    sign_label: Mapped[str] = mapped_column(String(255), index=True)
    video_url: Mapped[str] = mapped_column(String(512))
    holistic_landmarks_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_contribution_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("contributed_videos.id"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
