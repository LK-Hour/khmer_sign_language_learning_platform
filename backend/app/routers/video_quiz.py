"""Video Word Quiz API endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, get_current_user
from app.db.models.video_quiz import VideoQuiz, VideoQuizQuestion
from app.db.session import get_db_session
from app.schemas.video_quiz import (
    QuizResultResponse,
    SubmitQuizRequest,
    SubmitSingleAnswerRequest,
    SubmitSingleAnswerResponse,
    VideoQuizDetailResponse,
    VideoQuizListItemResponse,
    VideoQuizQuestionResponse,
)
from app.services.video_quiz_service import VideoQuizService

router = APIRouter(prefix="/video-quiz", tags=["video-quiz"])


@router.get("/", response_model=list[VideoQuizListItemResponse])
async def list_quizzes(
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _: Annotated[CurrentUser, Depends(get_current_user)],
) -> list[VideoQuizListItemResponse]:
    quizzes = (await db.scalars(select(VideoQuiz).where(VideoQuiz.is_active == True))).all()  # noqa: E712
    return [
        VideoQuizListItemResponse(
            id=q.id,
            title=q.title,
            description=q.description,
            quiz_type=q.quiz_type.value,
            question_count=q.question_count,
            pass_threshold=q.pass_threshold,
            time_limit_seconds=q.time_limit_seconds,
        )
        for q in quizzes
    ]


@router.get("/{quiz_id}", response_model=VideoQuizDetailResponse)
async def get_quiz(
    quiz_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _: Annotated[CurrentUser, Depends(get_current_user)],
) -> VideoQuizDetailResponse:
    quiz = await db.scalar(select(VideoQuiz).where(VideoQuiz.id == quiz_id))
    if quiz is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    questions = (
        await db.scalars(
            select(VideoQuizQuestion)
            .where(VideoQuizQuestion.quiz_id == quiz_id)
            .order_by(VideoQuizQuestion.order)
        )
    ).all()

    return VideoQuizDetailResponse(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        quiz_type=quiz.quiz_type.value,
        question_count=quiz.question_count,
        pass_threshold=quiz.pass_threshold,
        time_limit_seconds=quiz.time_limit_seconds,
        questions=[
            VideoQuizQuestionResponse(
                id=q.id,
                order=q.order,
                video_url=q.video_url,
                video_duration_seconds=q.video_duration_seconds,
                prompt=q.prompt,
                question_type=q.question_type.value,
                options=q.options,
            )
            for q in questions
        ],
    )


@router.post("/{quiz_id}/answer", response_model=SubmitSingleAnswerResponse)
async def submit_single_answer(
    quiz_id: uuid.UUID,
    payload: SubmitSingleAnswerRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> SubmitSingleAnswerResponse:
    service = VideoQuizService(db)
    try:
        result = await service.submit_single_answer(
            user_id=current_user.id,
            timezone_name=current_user.timezone,
            quiz_id=quiz_id,
            attempt_id=payload.attempt_id,
            question_id=payload.question_id,
            user_answer=payload.user_answer,
        )
    except ValueError as exc:
        message = str(exc)
        if "not found" in message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message) from exc
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message) from exc
    return SubmitSingleAnswerResponse(**result)


@router.post("/{quiz_id}/submit", response_model=QuizResultResponse)
async def submit_quiz(
    quiz_id: uuid.UUID,
    payload: SubmitQuizRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> QuizResultResponse:
    if payload.quiz_id is not None and payload.quiz_id != quiz_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="quiz_id in body does not match path",
        )

    service = VideoQuizService(db)
    responses = [r.model_dump() for r in payload.responses] if payload.responses else None
    try:
        result = await service.submit_quiz(
            user_id=current_user.id,
            timezone_name=current_user.timezone,
            quiz_id=quiz_id,
            attempt_id=payload.attempt_id,
            responses=responses,
        )
    except ValueError as exc:
        message = str(exc)
        if "not found" in message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message) from exc
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message) from exc
    return QuizResultResponse(**result)
