"""Video Quiz business logic service."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.video_quiz import (
    VideoQuiz,
    VideoQuizAttempt,
    VideoQuizAttemptStatus,
    VideoQuizQuestion,
    VideoQuizResponse,
)
from app.services.answer_checking import check_answer
from app.services.gamification import award_xp_and_badges


class VideoQuizService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_quiz(self, quiz_id: uuid.UUID) -> VideoQuiz | None:
        return await self.db.scalar(select(VideoQuiz).where(VideoQuiz.id == quiz_id))

    async def _get_question(self, quiz_id: uuid.UUID, question_id: uuid.UUID) -> VideoQuizQuestion | None:
        return await self.db.scalar(
            select(VideoQuizQuestion).where(
                VideoQuizQuestion.id == question_id,
                VideoQuizQuestion.quiz_id == quiz_id,
            )
        )

    async def _get_or_create_attempt(
        self,
        *,
        user_id: uuid.UUID,
        quiz_id: uuid.UUID,
        attempt_id: uuid.UUID | None,
    ) -> VideoQuizAttempt:
        if attempt_id is not None:
            attempt = await self.db.scalar(
                select(VideoQuizAttempt).where(
                    VideoQuizAttempt.id == attempt_id,
                    VideoQuizAttempt.user_id == user_id,
                )
            )
            if attempt is None:
                raise ValueError("Attempt not found")
            if attempt.quiz_id != quiz_id:
                raise ValueError("Attempt does not belong to this quiz")
            if attempt.status == VideoQuizAttemptStatus.COMPLETED:
                raise ValueError("Attempt already completed")
            return attempt

        now = datetime.now(timezone.utc)
        attempt = VideoQuizAttempt(
            id=uuid.uuid4(),
            user_id=user_id,
            quiz_id=quiz_id,
            status=VideoQuizAttemptStatus.IN_PROGRESS,
            started_at=now,
        )
        self.db.add(attempt)
        await self.db.flush()
        return attempt

    async def submit_single_answer(
        self,
        *,
        user_id: uuid.UUID,
        timezone_name: str,
        quiz_id: uuid.UUID,
        attempt_id: uuid.UUID | None,
        question_id: uuid.UUID,
        user_answer: str,
    ) -> dict[str, Any]:
        _ = timezone_name  # streak/XP is only applied on final submit

        quiz = await self._get_quiz(quiz_id)
        if quiz is None or not quiz.is_active:
            raise ValueError("Quiz not found")

        question = await self._get_question(quiz_id, question_id)
        if question is None:
            raise ValueError("Question not found")

        attempt = await self._get_or_create_attempt(
            user_id=user_id,
            quiz_id=quiz_id,
            attempt_id=attempt_id,
        )

        # Default similarity threshold if enabled but not specified.
        threshold = question.similarity_threshold if question.similarity_threshold is not None else 0.8

        result = check_answer(
            user_answer,
            correct_answer=question.correct_answer,
            acceptable_answers=question.acceptable_answers,
            enable_similarity=bool(question.enable_similarity),
            similarity_threshold=float(threshold),
        )

        existing = await self.db.scalar(
            select(VideoQuizResponse).where(
                VideoQuizResponse.attempt_id == attempt.id,
                VideoQuizResponse.question_id == question.id,
            )
        )

        points = 10 if result.is_correct else 0
        now = datetime.now(timezone.utc)
        if existing is None:
            existing = VideoQuizResponse(
                id=uuid.uuid4(),
                attempt_id=attempt.id,
                question_id=question.id,
            )
            self.db.add(existing)

        existing.user_answer = user_answer
        existing.normalized_user_answer = result.normalized_user_answer
        existing.is_correct = result.is_correct
        existing.similarity_score = result.similarity_score
        existing.points_earned = points
        existing.answered_at = now

        await self.db.commit()

        return {
            "attempt_id": attempt.id,
            "question_id": question.id,
            "is_correct": result.is_correct,
            "correct_answer": question.correct_answer,
            "explanation": question.explanation,
            "similarity_score": result.similarity_score,
        }

    async def submit_quiz(
        self,
        *,
        user_id: uuid.UUID,
        timezone_name: str,
        quiz_id: uuid.UUID,
        attempt_id: uuid.UUID | None,
        responses: list[dict[str, Any]] | None,
    ) -> dict[str, Any]:
        quiz = await self._get_quiz(quiz_id)
        if quiz is None or not quiz.is_active:
            raise ValueError("Quiz not found")

        attempt = await self._get_or_create_attempt(
            user_id=user_id,
            quiz_id=quiz_id,
            attempt_id=attempt_id,
        )

        # If the client sends answers at submit-time, record/overwrite them.
        if responses:
            for response_data in responses:
                question_id_raw = response_data.get("question_id")
                user_answer = response_data.get("user_answer", "")
                if not question_id_raw:
                    continue

                question_id = question_id_raw
                if isinstance(question_id_raw, str):
                    question_id = uuid.UUID(question_id_raw)

                question = await self._get_question(quiz_id, question_id)
                if question is None:
                    continue

                threshold = (
                    question.similarity_threshold
                    if question.similarity_threshold is not None
                    else 0.8
                )
                result = check_answer(
                    str(user_answer),
                    correct_answer=question.correct_answer,
                    acceptable_answers=question.acceptable_answers,
                    enable_similarity=bool(question.enable_similarity),
                    similarity_threshold=float(threshold),
                )

                existing = await self.db.scalar(
                    select(VideoQuizResponse).where(
                        VideoQuizResponse.attempt_id == attempt.id,
                        VideoQuizResponse.question_id == question.id,
                    )
                )
                points = 10 if result.is_correct else 0
                now = datetime.now(timezone.utc)
                if existing is None:
                    existing = VideoQuizResponse(
                        id=uuid.uuid4(),
                        attempt_id=attempt.id,
                        question_id=question.id,
                    )
                    self.db.add(existing)

                existing.user_answer = str(user_answer)
                existing.normalized_user_answer = result.normalized_user_answer
                existing.is_correct = result.is_correct
                existing.similarity_score = result.similarity_score
                existing.points_earned = points
                existing.answered_at = now

        total_questions = await self.db.scalar(
            select(func.count(VideoQuizQuestion.id)).where(VideoQuizQuestion.quiz_id == quiz_id)
        )
        total_questions_int = int(total_questions or 0)

        correct_answers = await self.db.scalar(
            select(func.count(VideoQuizResponse.id)).where(
                VideoQuizResponse.attempt_id == attempt.id,
                VideoQuizResponse.is_correct == True,  # noqa: E712
            )
        )
        correct_int = int(correct_answers or 0)

        score_percent = int((correct_int / total_questions_int) * 100) if total_questions_int else 0
        passed = score_percent >= int(quiz.pass_threshold)

        now = datetime.now(timezone.utc)
        attempt.completed_at = now
        attempt.status = VideoQuizAttemptStatus.COMPLETED
        attempt.passed = passed
        attempt.score_percent = score_percent
        if attempt.started_at is not None:
            attempt.time_spent_seconds = int((now - attempt.started_at).total_seconds())

        # Quiz XP rule (Khmer + English):
        # - Base 100 XP + 10 per correct answer
        # - Perfect score bonus +50 XP
        # (XP មូលដ្ឋាន 100 + 10 សម្រាប់ចម្លើយត្រឹមត្រូវមួយ; បើ 100% បន្ថែម 50)
        xp_earned = 100 + (correct_int * 10)
        badges: list[str] = []
        if passed:
            badges.append("quiz_master")
        if score_percent == 100 and total_questions_int > 0:
            badges.append("perfect_score")
            xp_earned += 50

        await award_xp_and_badges(
            db=self.db,
            user_id=user_id,
            xp=xp_earned,
            badges=badges,
            timezone_name=timezone_name,
        )

        await self.db.commit()

        return {
            "attempt_id": attempt.id,
            "score_percent": score_percent,
            "passed": passed,
            "total_questions": total_questions_int,
            "correct_answers": correct_int,
            "time_spent_seconds": attempt.time_spent_seconds,
            "xp_earned": xp_earned,
            "badges_earned": badges,
        }
