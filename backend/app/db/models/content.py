from __future__ import annotations

import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ExerciseType(str, enum.Enum):
    VIDEO_WATCH = "VIDEO_WATCH"
    SIGN_MATCH = "SIGN_MATCH"
    PICTURE_MATCH = "PICTURE_MATCH"
    AI_PRACTICE = "AI_PRACTICE"
    DIALOGUE = "DIALOGUE"


class SpellingExerciseType(str, enum.Enum):
    LETTER_WATCH = "LETTER_WATCH"
    LETTER_MATCH = "LETTER_MATCH"
    AI_SPELL = "AI_SPELL"
    WORD_SPELL = "WORD_SPELL"


class Unit(Base):
    __tablename__ = "units"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    order: Mapped[int] = mapped_column(Integer, index=True)
    cover_image_url: Mapped[str] = mapped_column(String(512))
    is_locked: Mapped[bool] = mapped_column(default=True)


class Chapter(Base):
    __tablename__ = "chapters"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("units.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    order: Mapped[int] = mapped_column(Integer, index=True)


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    chapter_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("chapters.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    order: Mapped[int] = mapped_column(Integer, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=10)


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    lesson_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("lessons.id"), index=True)
    type: Mapped[ExerciseType] = mapped_column(Enum(ExerciseType, name="exercise_type"))
    order: Mapped[int] = mapped_column(Integer, index=True)
    sign_video_url: Mapped[str] = mapped_column(String(512))
    slow_mo_video_url: Mapped[str] = mapped_column(String(512))
    options_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    correct_answer: Mapped[str] = mapped_column(String(255))


class SpellingSection(Base):
    __tablename__ = "spelling_sections"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255))
    order: Mapped[int] = mapped_column(Integer, index=True)
    letters_covered_json: Mapped[str] = mapped_column(Text, default="[]")


class DrillSet(Base):
    __tablename__ = "drill_sets"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    section_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("spelling_sections.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    order: Mapped[int] = mapped_column(Integer, index=True)


class SpellingExercise(Base):
    __tablename__ = "spelling_exercises"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    drill_set_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("drill_sets.id"), index=True)
    type: Mapped[SpellingExerciseType] = mapped_column(
        Enum(SpellingExerciseType, name="spelling_exercise_type")
    )
    order: Mapped[int] = mapped_column(Integer, index=True)
    letter: Mapped[str | None] = mapped_column(String(8), nullable=True)
    word: Mapped[str | None] = mapped_column(String(64), nullable=True)
    hand_shape_video_url: Mapped[str] = mapped_column(String(512))
    slow_mo_video_url: Mapped[str] = mapped_column(String(512))
    options_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    correct_answer: Mapped[str] = mapped_column(String(255))
