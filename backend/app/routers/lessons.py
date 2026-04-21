import uuid
from datetime import datetime, timezone
from typing import Annotated
import json

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, get_current_user
from app.db.session import get_db_session
from app.models.content import Chapter, Exercise, Lesson
from app.models.progress import LearningTrack, UserProgress
from app.schemas.progress import CompletionRequest
from app.services.gamification import apply_completion_rewards

router = APIRouter(tags=["lessons"])


class LessonSummary(BaseModel):
    id: str
    title: str
    order: int
    duration_minutes: int


class ChapterDetailResponse(BaseModel):
    chapter_id: str
    title: str
    lessons: list[LessonSummary]


class LessonExercise(BaseModel):
    id: str
    type: str
    order: int
    sign_video_url: str
    slow_mo_video_url: str
    options: list[str] | None
    correct_answer: str


class LessonDetailResponse(BaseModel):
    lesson_id: str
    chapter_id: str
    title: str
    order: int
    duration_minutes: int
    exercises: list[LessonExercise]


@router.get("/chapters/{chapter_id}")
async def get_chapter(
    chapter_id: str,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ChapterDetailResponse:
    try:
        parsed_id = uuid.UUID(chapter_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid chapter id") from exc

    chapter = await db.scalar(select(Chapter).where(Chapter.id == parsed_id))
    if chapter is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")

    lesson_rows = await db.scalars(select(Lesson).where(Lesson.chapter_id == chapter.id).order_by(Lesson.order))
    lessons = [
        LessonSummary(
            id=str(lesson.id),
            title=lesson.title,
            order=lesson.order,
            duration_minutes=lesson.duration_minutes,
        )
        for lesson in lesson_rows.all()
    ]
    return ChapterDetailResponse(chapter_id=str(chapter.id), title=chapter.title, lessons=lessons)


@router.get("/lessons/{lesson_id}")
async def get_lesson(
    lesson_id: str,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> LessonDetailResponse:
    try:
        parsed_id = uuid.UUID(lesson_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lesson id") from exc

    lesson = await db.scalar(select(Lesson).where(Lesson.id == parsed_id))
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    exercise_rows = await db.scalars(
        select(Exercise).where(Exercise.lesson_id == lesson.id).order_by(Exercise.order)
    )
    exercises = [
        LessonExercise(
            id=str(exercise.id),
            type=exercise.type.value,
            order=exercise.order,
            sign_video_url=exercise.sign_video_url,
            slow_mo_video_url=exercise.slow_mo_video_url,
            options=json.loads(exercise.options_json) if exercise.options_json else None,
            correct_answer=exercise.correct_answer,
        )
        for exercise in exercise_rows.all()
    ]
    return LessonDetailResponse(
        lesson_id=str(lesson.id),
        chapter_id=str(lesson.chapter_id),
        title=lesson.title,
        order=lesson.order,
        duration_minutes=lesson.duration_minutes,
        exercises=exercises,
    )


@router.post("/lessons/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: str,
    payload: CompletionRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict[str, str | float | int]:
    try:
        parsed_id = uuid.UUID(lesson_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lesson id") from exc

    lesson = await db.scalar(select(Lesson).where(Lesson.id == parsed_id))
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    progress = UserProgress(
        user_id=current_user.id,
        track=LearningTrack.SIGN_LANGUAGE,
        lesson_id=lesson.id,
        score=payload.score,
        stars=payload.stars,
        retry_count=0,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(progress)
    await apply_completion_rewards(db, current_user.id, payload.score, current_user.timezone)
    await db.commit()
    return {
        "lesson_id": lesson_id,
        "score": payload.score,
        "stars": payload.stars,
        "message": "Lesson completion saved",
    }
