from datetime import datetime, timezone
from uuid import UUID
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, get_current_user
from app.db.session import get_db_session
from app.db.models.progress import LearningTrack, UserProgress
from app.services.gamification import apply_completion_rewards

router = APIRouter(prefix="/sync", tags=["sync"])


class OfflineProgressItem(BaseModel):
    track: LearningTrack
    score: float = Field(ge=0, le=100)
    stars: int = Field(ge=0, le=5)
    retry_count: int = Field(default=0, ge=0)
    lesson_id: UUID | None = None
    exercise_id: UUID | None = None
    drill_set_id: UUID | None = None
    spelling_exercise_id: UUID | None = None


class OfflineProgressPayload(BaseModel):
    items: list[OfflineProgressItem]


@router.post("/progress")
async def sync_progress(
    payload: OfflineProgressPayload,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict[str, int]:
    for item in payload.items:
        db.add(
            UserProgress(
                user_id=current_user.id,
                track=item.track,
                lesson_id=item.lesson_id,
                exercise_id=item.exercise_id,
                drill_set_id=item.drill_set_id,
                spelling_exercise_id=item.spelling_exercise_id,
                score=item.score,
                stars=item.stars,
                retry_count=item.retry_count,
                completed_at=datetime.now(timezone.utc),
            )
        )
        await apply_completion_rewards(db, current_user.id, item.score, current_user.timezone)

    await db.commit()
    return {"accepted": len(payload.items)}
