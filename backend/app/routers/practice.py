from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, get_current_user
from app.db.session import get_db_session
from app.db.models.contributed_video import ContributedVideo, ContributedVideoStatus
from app.db.models.progress import LearningTrack
from app.services.ai.sign_evaluator import evaluate_sign_landmarks
from app.services.ai.spelling_evaluator import evaluate_spelling_landmarks

router = APIRouter(prefix="/practice", tags=["practice"])


class EvaluateSignRequest(BaseModel):
    sign_label: str
    landmarks: list[float] = Field(default_factory=list)


class EvaluateSpellingRequest(BaseModel):
    letter: str
    landmarks: list[float] = Field(default_factory=list)


class ContributeRequest(BaseModel):
    label: str
    video_blob: str
    consent: bool = False


@router.post("/sign/evaluate")
async def evaluate_sign(payload: EvaluateSignRequest) -> dict[str, object]:
    result = evaluate_sign_landmarks(payload.landmarks, payload.sign_label)
    return result


@router.post("/spelling/evaluate")
async def evaluate_spelling(payload: EvaluateSpellingRequest) -> dict[str, object]:
    result = evaluate_spelling_landmarks(payload.landmarks, payload.letter)
    return result


@router.post("/sign/contribute")
async def contribute_sign(
    payload: ContributeRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict[str, str]:
    if payload.consent is not True:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Explicit consent is required before contribution is accepted",
        )

    db.add(
        ContributedVideo(
            user_id=current_user.id,
            track=LearningTrack.SIGN_LANGUAGE,
            sign_label=payload.label,
            video_url=payload.video_blob,
            consent_given=True,
            status=ContributedVideoStatus.PENDING,
        )
    )
    await db.commit()
    return {"message": "Contribution request accepted for review"}


@router.post("/spelling/contribute")
async def contribute_spelling(
    payload: ContributeRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict[str, str]:
    if payload.consent is not True:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Explicit consent is required before contribution is accepted",
        )

    db.add(
        ContributedVideo(
            user_id=current_user.id,
            track=LearningTrack.FINGER_SPELLING,
            sign_label=payload.label,
            video_url=payload.video_blob,
            consent_given=True,
            status=ContributedVideoStatus.PENDING,
        )
    )
    await db.commit()
    return {"message": "Contribution request accepted for review"}
