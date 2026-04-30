#!/usr/bin/env python3
"""Seed video quiz with test data (async)."""

from __future__ import annotations

import asyncio
import uuid

from app.db.models.video_quiz import (
    VideoQuiz,
    VideoQuizQuestion,
    VideoQuizQuestionType,
    VideoQuizType,
)
from app.db.session import AsyncSessionLocal


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        quiz_id = uuid.uuid4()
        quiz = VideoQuiz(
            id=quiz_id,
            title="Unit 1 - Greetings Quiz (Video)",
            description="Watch videos of greetings and guess the meaning",
            quiz_type=VideoQuizType.SIGN_LANGUAGE,
            chapter_id=None,
            question_count=3,
            pass_threshold=70,
            is_active=True,
        )
        session.add(quiz)
        await session.flush()

        questions = [
            VideoQuizQuestion(
                id=uuid.uuid4(),
                quiz_id=quiz_id,
                order=1,
                video_url="https://cdn.example.com/hello.mp4",
                video_duration_seconds=3,
                prompt="What greeting sign is shown?",
                question_type=VideoQuizQuestionType.MULTIPLE_CHOICE,
                correct_answer="hello",
                options=["hello", "goodbye", "thank you", "yes"],
                acceptable_answers=["hi", "hey", "សួស្តី"],
                explanation="This sign is commonly used as a greeting.",
            ),
            VideoQuizQuestion(
                id=uuid.uuid4(),
                quiz_id=quiz_id,
                order=2,
                video_url="https://cdn.example.com/goodbye.mp4",
                video_duration_seconds=3,
                prompt="What greeting sign is shown?",
                question_type=VideoQuizQuestionType.MULTIPLE_CHOICE,
                correct_answer="goodbye",
                options=["hello", "goodbye", "thank you", "no"],
                acceptable_answers=["bye", "see you", "លាហើយ"],
                explanation="This sign is used when leaving.",
            ),
            VideoQuizQuestion(
                id=uuid.uuid4(),
                quiz_id=quiz_id,
                order=3,
                video_url="https://cdn.example.com/thank_you.mp4",
                video_duration_seconds=3,
                prompt="Type the meaning of this sign",
                question_type=VideoQuizQuestionType.INPUT,
                correct_answer="thank you",
                options=None,
                acceptable_answers=["thanks", "thx", "អរគុណ"],
                enable_similarity=True,
                similarity_threshold=0.8,
                explanation="Used to express gratitude.",
            ),
        ]

        session.add_all(questions)
        await session.commit()

        print(f"Seeded video quiz: {quiz_id}")


if __name__ == "__main__":
    asyncio.run(seed())
