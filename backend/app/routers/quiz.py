import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, get_current_user
from app.db.session import get_db_session
from app.db_models.content import Chapter, DrillSet, Exercise, Lesson, SpellingSection, SpellingExercise
from app.db_models.progress import LearningTrack, UserProgress
from app.schemas.progress import CompletionRequest
from app.services.gamification import apply_completion_rewards

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.get("/chapter/{chapter_id}")
async def get_chapter_quiz(
    chapter_id: str,
    db: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    try:
        parsed_id = uuid.UUID(chapter_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid chapter id") from exc

    chapter = await db.scalar(select(Chapter).where(Chapter.id == parsed_id))
    if chapter is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")

    lessons = await db.scalars(select(Lesson.id).where(Lesson.chapter_id == chapter.id))
    lesson_ids = list(lessons.all())
    if not lesson_ids:
        return {"chapter_id": chapter_id, "questions": []}

    exercise_rows = await db.scalars(select(Exercise).where(Exercise.lesson_id.in_(lesson_ids)).limit(15))
    questions = [
        {
            "exercise_id": str(exercise.id),
            "type": exercise.type.value,
            "prompt": exercise.correct_answer,
            "options": exercise.options_json,
        }
        for exercise in exercise_rows.all()
    ]
    return {"chapter_id": chapter_id, "questions": questions}


@router.post("/chapter/{chapter_id}/submit")
async def submit_chapter_quiz(
    chapter_id: str,
    payload: CompletionRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict[str, str | float]:
    _ = chapter_id
    progress = UserProgress(
        user_id=current_user.id,
        track=LearningTrack.SIGN_LANGUAGE,
        score=payload.score,
        stars=payload.stars,
        retry_count=0,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(progress)
    await apply_completion_rewards(db, current_user.id, payload.score, current_user.timezone)
    await db.commit()
    return {
        "chapter_id": chapter_id,
        "score": payload.score,
        "passed": payload.score >= 70,
        "message": "Chapter quiz submitted",
    }


@router.get("/spelling/{section_id}")
async def get_spelling_quiz(
    section_id: str,
    db: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    try:
        parsed_id = uuid.UUID(section_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid section id") from exc

    section = await db.scalar(select(SpellingSection).where(SpellingSection.id == parsed_id))
    if section is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")

    drills = await db.scalars(select(DrillSet.id).where(DrillSet.section_id == section.id))
    drill_ids = list(drills.all())
    if not drill_ids:
        return {"section_id": section_id, "questions": []}

    exercise_rows = await db.scalars(
        select(SpellingExercise).where(SpellingExercise.drill_set_id.in_(drill_ids)).limit(15)
    )
    questions = [
        {
            "exercise_id": str(exercise.id),
            "type": exercise.type.value,
            "prompt": exercise.correct_answer,
            "options": exercise.options_json,
        }
        for exercise in exercise_rows.all()
    ]
    return {"section_id": section_id, "questions": questions}


@router.post("/spelling/{section_id}/submit")
async def submit_spelling_quiz(
    section_id: str,
    payload: CompletionRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict[str, str | float]:
    _ = section_id
    progress = UserProgress(
        user_id=current_user.id,
        track=LearningTrack.FINGER_SPELLING,
        score=payload.score,
        stars=payload.stars,
        retry_count=0,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(progress)
    await apply_completion_rewards(db, current_user.id, payload.score, current_user.timezone)
    await db.commit()
    return {
        "section_id": section_id,
        "score": payload.score,
        "passed": payload.score >= 75,
        "message": "Spelling quiz submitted",
    }
