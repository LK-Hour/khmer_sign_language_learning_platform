from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LearningTrack(str, enum.Enum):
    SIGN_LANGUAGE = "SIGN_LANGUAGE"
    FINGER_SPELLING = "FINGER_SPELLING"


class UserProgress(Base):
    __tablename__ = "user_progress"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    track: Mapped[LearningTrack] = mapped_column(Enum(LearningTrack, name="learning_track"))
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("lessons.id"), nullable=True)
    exercise_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("exercises.id"), nullable=True)
    drill_set_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("drill_sets.id"), nullable=True)
    spelling_exercise_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("spelling_exercises.id"), nullable=True
    )
    score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    stars: Mapped[int] = mapped_column(Integer, default=0)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
