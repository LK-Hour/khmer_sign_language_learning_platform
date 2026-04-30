"""Pydantic schemas for Video Quiz API."""

from __future__ import annotations

import uuid
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class VideoQuizQuestionType(str, Enum):
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    INPUT = "INPUT"


class VideoQuizListItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    quiz_type: str
    question_count: int
    pass_threshold: int
    time_limit_seconds: int | None


class VideoQuizQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    order: int
    video_url: str
    video_duration_seconds: int | None
    prompt: str
    question_type: VideoQuizQuestionType
    options: list[str] | None = None


class VideoQuizDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    quiz_type: str
    question_count: int
    pass_threshold: int
    time_limit_seconds: int | None
    questions: list[VideoQuizQuestionResponse]


class SubmitAnswerRequest(BaseModel):
    question_id: uuid.UUID
    user_answer: str


class SubmitSingleAnswerRequest(BaseModel):
    attempt_id: uuid.UUID | None = None
    question_id: uuid.UUID
    user_answer: str


class SubmitSingleAnswerResponse(BaseModel):
    attempt_id: uuid.UUID
    question_id: uuid.UUID
    is_correct: bool
    correct_answer: str
    explanation: str | None
    similarity_score: float | None = None


class SubmitQuizRequest(BaseModel):
    # Backward compatibility: frontend may send quiz_id in body.
    quiz_id: uuid.UUID | None = None
    attempt_id: uuid.UUID | None = None
    responses: list[SubmitAnswerRequest] = Field(default_factory=list)

    @model_validator(mode="after")
    def _validate_submit_payload(self) -> "SubmitQuizRequest":
        if self.attempt_id is None and not self.responses:
            raise ValueError("Either attempt_id or responses must be provided")
        return self


class QuizResultResponse(BaseModel):
    attempt_id: uuid.UUID
    score_percent: int
    passed: bool
    total_questions: int
    correct_answers: int
    time_spent_seconds: int | None
    xp_earned: int
    badges_earned: list[str]
