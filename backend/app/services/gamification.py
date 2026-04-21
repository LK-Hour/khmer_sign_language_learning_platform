from datetime import date, datetime, timedelta
from uuid import UUID
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserStats


def compute_exercise_xp(base_xp: int, accuracy_percent: float) -> int:
    if accuracy_percent >= 90:
        return int(base_xp * 1.5)
    if accuracy_percent >= 70:
        return int(base_xp * 1.2)
    return base_xp


def _current_date(timezone_name: str) -> date:
    return datetime.now(ZoneInfo(timezone_name)).date()


async def apply_completion_rewards(db: AsyncSession, user_id: UUID, score: float, timezone_name: str) -> None:
    stats = await db.scalar(select(UserStats).where(UserStats.user_id == user_id))
    if stats is None:
        stats = UserStats(
            user_id=user_id,
            current_streak=0,
            longest_streak=0,
            total_xp=0,
            badges_json="[]",
        )
        db.add(stats)
        await db.flush()

    today = _current_date(timezone_name)
    awarded_xp = compute_exercise_xp(base_xp=10, accuracy_percent=score)
    stats.total_xp += awarded_xp
    if stats.last_active_date is None:
        stats.current_streak = 1
    elif stats.last_active_date == today:
        stats.current_streak = stats.current_streak
    elif stats.last_active_date == today - timedelta(days=1):
        stats.current_streak += 1
    else:
        stats.current_streak = 1
    if stats.current_streak > stats.longest_streak:
        stats.longest_streak = stats.current_streak
    stats.last_active_date = today
