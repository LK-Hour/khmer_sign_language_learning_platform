from __future__ import annotations

import json

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.db.models.content import (
    Chapter,
    DrillSet,
    Exercise,
    ExerciseType,
    Lesson,
    SpellingExercise,
    SpellingExerciseType,
    SpellingSection,
    Unit,
)
from app.db.models.user import User, UserRole, UserStats


def _media_url(path: str) -> str:
    return f"{settings.media_base_url.rstrip('/')}/{path.lstrip('/')}"


async def seed_phase1_data(db: AsyncSession) -> None:
    existing_units = await db.scalar(select(func.count()).select_from(Unit))
    existing_sections = await db.scalar(select(func.count()).select_from(SpellingSection))
    if (existing_units or 0) > 0 or (existing_sections or 0) > 0:
        return

    unit = Unit(
        title="Unit 1 - Greetings",
        description="Learn the most common greetings in Khmer Sign Language.",
        order=1,
        cover_image_url=_media_url("units/greetings-cover.jpg"),
        is_locked=False,
    )
    db.add(unit)
    await db.flush()

    chapter_1 = Chapter(unit_id=unit.id, title="Chapter 1 - Hello & Goodbye", order=1)
    chapter_2 = Chapter(unit_id=unit.id, title="Chapter 2 - Introducing Yourself", order=2)
    db.add_all([chapter_1, chapter_2])
    await db.flush()

    lesson_1 = Lesson(chapter_id=chapter_1.id, title="Lesson 1 - Saying Hello", order=1, duration_minutes=10)
    lesson_2 = Lesson(chapter_id=chapter_1.id, title="Lesson 2 - Saying Goodbye", order=2, duration_minutes=10)
    lesson_3 = Lesson(
        chapter_id=chapter_2.id,
        title="Lesson 3 - My Name Is...",
        order=1,
        duration_minutes=12,
    )
    lesson_4 = Lesson(
        chapter_id=chapter_2.id,
        title="Lesson 4 - Nice to Meet You",
        order=2,
        duration_minutes=12,
    )
    db.add_all([lesson_1, lesson_2, lesson_3, lesson_4])
    await db.flush()

    lesson_1_exercises = [
        Exercise(
            lesson_id=lesson_1.id,
            type=ExerciseType.VIDEO_WATCH,
            order=1,
            sign_video_url=_media_url("signs/hello.mp4"),
            slow_mo_video_url=_media_url("signs/hello-slow.mp4"),
            options_json=None,
            correct_answer="Hello",
        ),
        Exercise(
            lesson_id=lesson_1.id,
            type=ExerciseType.SIGN_MATCH,
            order=2,
            sign_video_url=_media_url("signs/hello.mp4"),
            slow_mo_video_url=_media_url("signs/hello-slow.mp4"),
            options_json=json.dumps(["Hello", "Thank you", "Goodbye", "Sorry"]),
            correct_answer="Hello",
        ),
        Exercise(
            lesson_id=lesson_1.id,
            type=ExerciseType.PICTURE_MATCH,
            order=3,
            sign_video_url=_media_url("signs/hello.mp4"),
            slow_mo_video_url=_media_url("signs/hello-slow.mp4"),
            options_json=json.dumps(["Hello", "Family", "Water", "Book"]),
            correct_answer="Hello",
        ),
    ]
    lesson_2_exercises = [
        Exercise(
            lesson_id=lesson_2.id,
            type=ExerciseType.VIDEO_WATCH,
            order=1,
            sign_video_url=_media_url("signs/goodbye.mp4"),
            slow_mo_video_url=_media_url("signs/goodbye-slow.mp4"),
            options_json=None,
            correct_answer="Goodbye",
        ),
        Exercise(
            lesson_id=lesson_2.id,
            type=ExerciseType.SIGN_MATCH,
            order=2,
            sign_video_url=_media_url("signs/goodbye.mp4"),
            slow_mo_video_url=_media_url("signs/goodbye-slow.mp4"),
            options_json=json.dumps(["Goodbye", "Hello", "Name", "Friend"]),
            correct_answer="Goodbye",
        ),
    ]
    lesson_3_exercises = [
        Exercise(
            lesson_id=lesson_3.id,
            type=ExerciseType.VIDEO_WATCH,
            order=1,
            sign_video_url=_media_url("signs/my-name-is.mp4"),
            slow_mo_video_url=_media_url("signs/my-name-is-slow.mp4"),
            options_json=None,
            correct_answer="My name is",
        ),
        Exercise(
            lesson_id=lesson_3.id,
            type=ExerciseType.SIGN_MATCH,
            order=2,
            sign_video_url=_media_url("signs/my-name-is.mp4"),
            slow_mo_video_url=_media_url("signs/my-name-is-slow.mp4"),
            options_json=json.dumps(["My name is", "How are you", "Good night", "Please"]),
            correct_answer="My name is",
        ),
    ]
    lesson_4_exercises = [
        Exercise(
            lesson_id=lesson_4.id,
            type=ExerciseType.VIDEO_WATCH,
            order=1,
            sign_video_url=_media_url("signs/nice-to-meet-you.mp4"),
            slow_mo_video_url=_media_url("signs/nice-to-meet-you-slow.mp4"),
            options_json=None,
            correct_answer="Nice to meet you",
        ),
        Exercise(
            lesson_id=lesson_4.id,
            type=ExerciseType.PICTURE_MATCH,
            order=2,
            sign_video_url=_media_url("signs/nice-to-meet-you.mp4"),
            slow_mo_video_url=_media_url("signs/nice-to-meet-you-slow.mp4"),
            options_json=json.dumps(["Nice to meet you", "Hello", "Family", "Learn"]),
            correct_answer="Nice to meet you",
        ),
    ]
    db.add_all([*lesson_1_exercises, *lesson_2_exercises, *lesson_3_exercises, *lesson_4_exercises])

    section_a = SpellingSection(
        title="Section A - Letters A to E",
        order=1,
        letters_covered_json=json.dumps(["A", "B", "C", "D", "E"]),
    )
    db.add(section_a)
    await db.flush()

    drill_1 = DrillSet(section_id=section_a.id, title="Drill 1 - Learn A, B, C", order=1)
    drill_2 = DrillSet(section_id=section_a.id, title="Drill 2 - Learn D, E", order=2)
    db.add_all([drill_1, drill_2])
    await db.flush()

    db.add_all(
        [
            SpellingExercise(
                drill_set_id=drill_1.id,
                type=SpellingExerciseType.LETTER_WATCH,
                order=1,
                letter="A",
                word=None,
                hand_shape_video_url=_media_url("spelling/a.mp4"),
                slow_mo_video_url=_media_url("spelling/a-slow.mp4"),
                options_json=None,
                correct_answer="A",
            ),
            SpellingExercise(
                drill_set_id=drill_1.id,
                type=SpellingExerciseType.LETTER_MATCH,
                order=2,
                letter="B",
                word=None,
                hand_shape_video_url=_media_url("spelling/b.mp4"),
                slow_mo_video_url=_media_url("spelling/b-slow.mp4"),
                options_json=json.dumps(["A", "B", "C", "D"]),
                correct_answer="B",
            ),
            SpellingExercise(
                drill_set_id=drill_1.id,
                type=SpellingExerciseType.LETTER_MATCH,
                order=3,
                letter="C",
                word=None,
                hand_shape_video_url=_media_url("spelling/c.mp4"),
                slow_mo_video_url=_media_url("spelling/c-slow.mp4"),
                options_json=json.dumps(["C", "E", "A", "B"]),
                correct_answer="C",
            ),
            SpellingExercise(
                drill_set_id=drill_2.id,
                type=SpellingExerciseType.LETTER_WATCH,
                order=1,
                letter="D",
                word=None,
                hand_shape_video_url=_media_url("spelling/d.mp4"),
                slow_mo_video_url=_media_url("spelling/d-slow.mp4"),
                options_json=None,
                correct_answer="D",
            ),
            SpellingExercise(
                drill_set_id=drill_2.id,
                type=SpellingExerciseType.LETTER_MATCH,
                order=2,
                letter="E",
                word=None,
                hand_shape_video_url=_media_url("spelling/e.mp4"),
                slow_mo_video_url=_media_url("spelling/e-slow.mp4"),
                options_json=json.dumps(["E", "A", "D", "B"]),
                correct_answer="E",
            ),
        ]
    )

    await db.commit()


async def seed_test_accounts(
    db: AsyncSession,
    learner_email: str,
    admin_email: str,
    password: str,
    timezone: str = "Asia/Phnom_Penh",
) -> None:
    async def upsert_user(email: str, display_name: str, role: UserRole) -> User:
        user = await db.scalar(select(User).where(User.email == email))
        if user is None:
            user = User(
                email=email,
                password_hash=hash_password(password),
                display_name=display_name,
                role=role,
                timezone=timezone,
                consent_for_video_contribution=False,
            )
            db.add(user)
            await db.flush()
        else:
            user.password_hash = hash_password(password)
            user.display_name = display_name
            user.role = role
            user.timezone = timezone
            user.consent_for_video_contribution = False

        stats = await db.scalar(select(UserStats).where(UserStats.user_id == user.id))
        if stats is None:
            db.add(
                UserStats(
                    user_id=user.id,
                    current_streak=0,
                    longest_streak=0,
                    total_xp=0,
                    badges_json="[]",
                )
            )
        return user

    await upsert_user(learner_email, "Test Learner", UserRole.LEARNER)
    await upsert_user(admin_email, "Test Admin", UserRole.ADMIN)
    await db.commit()
