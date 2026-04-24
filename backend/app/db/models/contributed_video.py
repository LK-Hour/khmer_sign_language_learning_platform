from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.models.progress import LearningTrack


class ContributedVideoStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ContributedVideo(Base):
    __tablename__ = "contributed_videos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    track: Mapped[LearningTrack] = mapped_column(Enum(LearningTrack, name="contribution_track"))
    sign_label: Mapped[str] = mapped_column(String(255))
    video_url: Mapped[str] = mapped_column(String(512))
    consent_given: Mapped[bool] = mapped_column(default=False)
    status: Mapped[ContributedVideoStatus] = mapped_column(
        Enum(ContributedVideoStatus, name="contributed_video_status"),
        default=ContributedVideoStatus.PENDING,
    )
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
