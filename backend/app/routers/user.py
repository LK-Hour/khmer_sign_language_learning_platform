import json
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, get_current_user
from app.db.session import get_db_session
from app.models.progress import UserProgress
from app.models.user import UserStats

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/stats")
async def get_user_stats(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> dict[str, object]:
    stats = await db.scalar(select(UserStats).where(UserStats.user_id == current_user.id))
    return {
        "user_id": str(current_user.id),
        "streak": 0 if stats is None else stats.current_streak,
        "xp": 0 if stats is None else stats.total_xp,
        "badges": [] if stats is None else json.loads(stats.badges_json),
    }


@router.get("/progress")
async def get_user_progress(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> dict[str, object]:
    rows = await db.scalars(select(UserProgress).where(UserProgress.user_id == current_user.id))
    items = [
        {
            "id": str(row.id),
            "track": row.track.value,
            "score": float(row.score),
            "stars": row.stars,
            "completed_at": row.completed_at.isoformat(),
        }
        for row in rows.all()
    ]
    return {"user_id": str(current_user.id), "items": items}
