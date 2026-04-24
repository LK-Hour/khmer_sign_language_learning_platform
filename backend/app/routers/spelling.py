import uuid
from datetime import datetime, timezone
import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, get_current_user
from app.db.session import get_db_session
from app.db_models.content import DrillSet, SpellingExercise, SpellingSection
from app.db_models.progress import LearningTrack, UserProgress
from app.schemas.progress import CompletionRequest
from app.services.gamification import apply_completion_rewards

router = APIRouter(prefix="/spelling", tags=["finger-spelling"])


class SectionListItem(BaseModel):
    id: str
    title: str
    progress_percent: int


class DrillSummary(BaseModel):
    id: str
    title: str
    order: int


class SectionDetailResponse(BaseModel):
    section_id: str
    title: str
    letters_covered: list[str]
    drill_sets: list[DrillSummary]


class DrillExercise(BaseModel):
    id: str
    type: str
    order: int
    letter: str | None
    word: str | None
    hand_shape_video_url: str
    slow_mo_video_url: str
    options: list[str] | None
    correct_answer: str


class DrillDetailResponse(BaseModel):
    drill_id: str
    section_id: str
    title: str
    order: int
    exercises: list[DrillExercise]


@router.get("/sections", response_model=list[SectionListItem])
async def get_sections(
    db: AsyncSession = Depends(get_db_session),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[SectionListItem]:
    offset = (page - 1) * limit
    rows = await db.scalars(select(SpellingSection).order_by(SpellingSection.order).offset(offset).limit(limit))
    return [
        SectionListItem(id=str(section.id), title=section.title, progress_percent=0)
        for section in rows.all()
    ]


@router.get("/sections/{section_id}")
async def get_section(
    section_id: str,
    db: AsyncSession = Depends(get_db_session),
) -> SectionDetailResponse:
    try:
        parsed_id = uuid.UUID(section_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid section id") from exc

    section = await db.scalar(select(SpellingSection).where(SpellingSection.id == parsed_id))
    if section is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")

    drill_rows = await db.scalars(
        select(DrillSet).where(DrillSet.section_id == section.id).order_by(DrillSet.order)
    )
    drills = [
        DrillSummary(id=str(drill.id), title=drill.title, order=drill.order)
        for drill in drill_rows.all()
    ]
    return SectionDetailResponse(
        section_id=str(section.id),
        title=section.title,
        letters_covered=json.loads(section.letters_covered_json),
        drill_sets=drills,
    )


@router.get("/drills/{drill_id}")
async def get_drill(
    drill_id: str,
    db: AsyncSession = Depends(get_db_session),
) -> DrillDetailResponse:
    try:
        parsed_id = uuid.UUID(drill_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid drill id") from exc

    drill = await db.scalar(select(DrillSet).where(DrillSet.id == parsed_id))
    if drill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drill not found")

    exercise_rows = await db.scalars(
        select(SpellingExercise).where(SpellingExercise.drill_set_id == drill.id).order_by(SpellingExercise.order)
    )
    exercises = [
        DrillExercise(
            id=str(exercise.id),
            type=exercise.type.value,
            order=exercise.order,
            letter=exercise.letter,
            word=exercise.word,
            hand_shape_video_url=exercise.hand_shape_video_url,
            slow_mo_video_url=exercise.slow_mo_video_url,
            options=json.loads(exercise.options_json) if exercise.options_json else None,
            correct_answer=exercise.correct_answer,
        )
        for exercise in exercise_rows.all()
    ]
    return DrillDetailResponse(
        drill_id=str(drill.id),
        section_id=str(drill.section_id),
        title=drill.title,
        order=drill.order,
        exercises=exercises,
    )


@router.post("/drills/{drill_id}/complete")
async def complete_drill(
    drill_id: str,
    payload: CompletionRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict[str, str | float | int]:
    try:
        parsed_id = uuid.UUID(drill_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid drill id") from exc

    drill = await db.scalar(select(DrillSet).where(DrillSet.id == parsed_id))
    if drill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drill not found")

    progress = UserProgress(
        user_id=current_user.id,
        track=LearningTrack.FINGER_SPELLING,
        drill_set_id=drill.id,
        score=payload.score,
        stars=payload.stars,
        retry_count=0,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(progress)
    await apply_completion_rewards(db, current_user.id, payload.score, current_user.timezone)
    await db.commit()
    return {
        "drill_id": drill_id,
        "score": payload.score,
        "stars": payload.stars,
        "message": "Drill completion saved",
    }
