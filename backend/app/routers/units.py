import uuid
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.db.models.content import Chapter, Lesson, Unit

router = APIRouter(tags=["sign-language"])


class UnitListItem(BaseModel):
    id: str
    title: str
    progress_percent: int


class LessonSummary(BaseModel):
    id: str
    title: str
    order: int
    duration_minutes: int


class ChapterDetail(BaseModel):
    id: str
    title: str
    order: int
    lessons: list[LessonSummary]


class UnitDetailResponse(BaseModel):
    id: str
    title: str
    description: str
    order: int
    cover_image_url: str
    is_locked: bool
    chapters: list[ChapterDetail]


@router.get("/units", response_model=list[UnitListItem])
async def get_units(
    db: AsyncSession = Depends(get_db_session),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[UnitListItem]:
    offset = (page - 1) * limit
    rows = await db.scalars(select(Unit).order_by(Unit.order).offset(offset).limit(limit))
    return [
        UnitListItem(id=str(unit.id), title=unit.title, progress_percent=0)
        for unit in rows.all()
    ]


@router.get("/units/{unit_id}", response_model=UnitDetailResponse)
async def get_unit_detail(
    unit_id: str,
    db: AsyncSession = Depends(get_db_session),
) -> UnitDetailResponse:
    try:
        parsed_id = uuid.UUID(unit_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid unit id") from exc

    unit = await db.scalar(select(Unit).where(Unit.id == parsed_id))
    if unit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")

    chapter_rows = await db.scalars(
        select(Chapter).where(Chapter.unit_id == unit.id).order_by(Chapter.order)
    )
    chapters = chapter_rows.all()
    chapter_ids = [chapter.id for chapter in chapters]

    lessons_by_chapter: dict[uuid.UUID, list[LessonSummary]] = defaultdict(list)
    if chapter_ids:
        lesson_rows = await db.scalars(
            select(Lesson).where(Lesson.chapter_id.in_(chapter_ids)).order_by(Lesson.order)
        )
        for lesson in lesson_rows.all():
            lessons_by_chapter[lesson.chapter_id].append(
                LessonSummary(
                    id=str(lesson.id),
                    title=lesson.title,
                    order=lesson.order,
                    duration_minutes=lesson.duration_minutes,
                )
            )

    return UnitDetailResponse(
        id=str(unit.id),
        title=unit.title,
        description=unit.description,
        order=unit.order,
        cover_image_url=unit.cover_image_url,
        is_locked=unit.is_locked,
        chapters=[
            ChapterDetail(
                id=str(chapter.id),
                title=chapter.title,
                order=chapter.order,
                lessons=lessons_by_chapter.get(chapter.id, []),
            )
            for chapter in chapters
        ],
    )
