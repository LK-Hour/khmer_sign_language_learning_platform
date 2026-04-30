from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, JSON, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class VideoQuizType(str, enum.Enum):
    SIGN_LANGUAGE = "SIGN_LANGUAGE"
    FINGER_SPELLING = "FINGER_SPELLING"


class VideoQuizQuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    INPUT = "INPUT"


class VideoQuizAttemptStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class VideoQuiz(Base):
    __tablename__ = "video_quizzes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    quiz_type: Mapped[VideoQuizType] = mapped_column(
        Enum(VideoQuizType, name="video_quiz_type"),
        default=VideoQuizType.SIGN_LANGUAGE,
    )

    chapter_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("chapters.id"), nullable=True, index=True)
    spelling_section_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("spelling_sections.id"), nullable=True, index=True
    )

    question_count: Mapped[int] = mapped_column(Integer, default=0)
    pass_threshold: Mapped[int] = mapped_column(Integer, default=70)
    time_limit_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class VideoQuizQuestion(Base):
    __tablename__ = "video_quiz_questions"
    __table_args__ = (
        UniqueConstraint("quiz_id", "order", name="uq_video_quiz_questions_quiz_order"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    quiz_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("video_quizzes.id"), index=True)

    order: Mapped[int] = mapped_column(Integer, index=True)

    video_url: Mapped[str] = mapped_column(String(512))
    video_duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)

    prompt: Mapped[str] = mapped_column(String(255))
    question_type: Mapped[VideoQuizQuestionType] = mapped_column(
        Enum(VideoQuizQuestionType, name="video_quiz_question_type"),
        default=VideoQuizQuestionType.MULTIPLE_CHOICE,
    )

    # Canonical answer shown *after* the user answers (feedback).
    correct_answer: Mapped[str] = mapped_column(String(255))

    # MULTIPLE_CHOICE only (4 options). INPUT questions should keep this null.
    options: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)

    # INPUT questions: synonyms + Khmer/English equivalents.
    # MULTIPLE_CHOICE can also use this for equivalences if desired.
    acceptable_answers: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)

    # Similarity matching (optional).
    enable_similarity: Mapped[bool] = mapped_column(Boolean, default=False)
    similarity_threshold: Mapped[float | None] = mapped_column(Float, nullable=True)

    explanation: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class VideoQuizAttempt(Base):
    __tablename__ = "video_quiz_attempts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    quiz_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("video_quizzes.id"), index=True)

    status: Mapped[VideoQuizAttemptStatus] = mapped_column(
        Enum(VideoQuizAttemptStatus, name="video_quiz_attempt_status"),
        default=VideoQuizAttemptStatus.IN_PROGRESS,
    )
    score_percent: Mapped[int] = mapped_column(Integer, default=0)
    time_spent_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    passed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)


class VideoQuizResponse(Base):
    __tablename__ = "video_quiz_responses"
    __table_args__ = (
        UniqueConstraint("attempt_id", "question_id", name="uq_video_quiz_responses_attempt_question"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    attempt_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("video_quiz_attempts.id"), index=True)
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("video_quiz_questions.id"), index=True)

    user_answer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    normalized_user_answer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    similarity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    points_earned: Mapped[int] = mapped_column(Integer, default=0)

    answered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
