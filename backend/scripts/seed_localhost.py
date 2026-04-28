"""
Seed script for localhost development using local dataset.
Uses: /data_set/education_words/24_sign/ for sign language
      /data_set/finger_spelling/ for finger spelling

Usage:
  python scripts/seed_localhost.py              # Skip if data exists
  python scripts/seed_localhost.py --force      # Clear old data and reseed
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path

# Allow running from the repo root without PYTHONPATH tweaks.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.config import settings
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
from app.db.session import AsyncSessionLocal
from sqlalchemy import select, func, text


def _media_url(path: str) -> str:
    """Build media URL from relative path."""
    return f"{settings.media_base_url.rstrip('/')}/{path.lstrip('/')}"


def _list_local_dataset(category: str) -> dict[str, list[str]]:
    """
    List all word/letter directories and their video files from local dataset.
    Returns: { "word_label": ["video1.mp4", "video2.mp4", ...] }
    """
    dataset = {}
    dataset_path = Path(settings.local_media_path)
    
    if category == "sign_language":
        words_path = dataset_path / "education_words" / "24_sign"
        if not words_path.exists():
            print(f"⚠ Sign language dataset not found at {words_path}")
            return dataset
        
        for word_dir in sorted(words_path.iterdir()):
            if word_dir.is_dir():
                videos = sorted([f.name for f in word_dir.glob("*.mp4")])
                if videos:
                    dataset[word_dir.name] = videos
    
    elif category == "finger_spelling":
        spelling_path = dataset_path / "finger_spelling"
        if not spelling_path.exists():
            print(f"⚠ Finger spelling dataset not found at {spelling_path}")
            return dataset
        
        for category_dir in sorted(spelling_path.iterdir()):
            if category_dir.is_dir():
                for letter_dir in sorted(category_dir.iterdir()):
                    if letter_dir.is_dir():
                        videos = sorted([f.name for f in letter_dir.glob("*.mp4")])
                        if videos:
                            dataset[letter_dir.name] = videos
    
    return dataset


async def seed_localhost_education_words(db, force: bool = False) -> None:
    """Seed Unit 1 using local education_words dataset."""
    existing_units = await db.scalar(select(func.count()).select_from(Unit))
    
    if force and (existing_units or 0) > 0:
        print("🗑️  Force flag set - clearing old Units data...")
        await db.execute(text("TRUNCATE TABLE exercises CASCADE"))
        await db.execute(text("TRUNCATE TABLE lessons CASCADE"))
        await db.execute(text("TRUNCATE TABLE chapters CASCADE"))
        await db.execute(text("TRUNCATE TABLE units CASCADE"))
        await db.commit()
        existing_units = 0
    
    if (existing_units or 0) > 0:
        print("✓ Units already exist, skipping... (use --force to replace)")
        return
        return
    
    # Create Unit 1 for education words
    unit = Unit(
        title="Unit 1 - Education & School",
        description="Learn education and school-related vocabulary in KSL using local dataset.",
        order=1,
        cover_image_url=_media_url("education_words/24_sign/សាលារៀន/សាលារៀន-1.mp4"),
        is_locked=False,
    )
    db.add(unit)
    await db.flush()
    
    # Create chapters (organize by categories)
    chapter_1 = Chapter(unit_id=unit.id, title="Chapter 1 - School & Places", order=1)
    chapter_2 = Chapter(unit_id=unit.id, title="Chapter 2 - Classroom Items", order=2)
    db.add_all([chapter_1, chapter_2])
    await db.flush()
    
    # Get local dataset
    local_words = _list_local_dataset("sign_language")
    print(f"📚 Found {len(local_words)} education words in local dataset")
    
    # Organize words into chapters
    school_words = ["សាលារៀន", "នាយិកា", "លោកគ្រូ", "អ្នកគ្រូ", "នាយករង"]
    classroom_words = list(local_words.keys())
    
    # Chapter 1 - School & Places (5 lessons)
    chapter_1_lessons = []
    for i, word in enumerate(school_words[:5], 1):
        if word in local_words:
            lesson = Lesson(
                chapter_id=chapter_1.id,
                title=f"Lesson {i} - {word}",
                order=i,
                duration_minutes=10,
            )
            chapter_1_lessons.append((lesson, word))
    
    db.add_all([L[0] for L in chapter_1_lessons])
    await db.flush()
    
    # Add exercises for Chapter 1 lessons
    for lesson, word in chapter_1_lessons:
        videos = local_words[word][:3]  # Use first 3 variants
        
        exercises = [
            Exercise(
                lesson_id=lesson.id,
                type=ExerciseType.VIDEO_WATCH,
                order=1,
                sign_video_url=_media_url(f"education_words/24_sign/{word}/{videos[0]}"),
                slow_mo_video_url=_media_url(f"education_words/24_sign/{word}/{videos[0]}"),
                options_json=None,
                correct_answer=word,
            ),
            Exercise(
                lesson_id=lesson.id,
                type=ExerciseType.SIGN_MATCH,
                order=2,
                sign_video_url=_media_url(f"education_words/24_sign/{word}/{videos[1] if len(videos) > 1 else videos[0]}"),
                slow_mo_video_url=_media_url(f"education_words/24_sign/{word}/{videos[1] if len(videos) > 1 else videos[0]}"),
                options_json=json.dumps([word, "ក់ផ្សេង", "វាក្យសព្ទផ្សេង", "ឧទាហរណ៍"]),
                correct_answer=word,
            ),
        ]
        db.add_all(exercises)
    
    await db.commit()
    print(f"✓ Seeded Chapter 1 with {len(chapter_1_lessons)} lessons from local dataset")
    
    # Chapter 2 - Classroom Items (remaining lessons)
    chapter_2_lessons = []
    chapter_2_words = [w for w in classroom_words if w not in school_words][:10]
    
    for i, word in enumerate(chapter_2_words, 1):
        lesson = Lesson(
            chapter_id=chapter_2.id,
            title=f"Lesson {i} - {word}",
            order=i,
            duration_minutes=10,
        )
        chapter_2_lessons.append((lesson, word))
    
    db.add_all([L[0] for L in chapter_2_lessons])
    await db.flush()
    
    for lesson, word in chapter_2_lessons:
        videos = local_words[word][:2]
        exercise = Exercise(
            lesson_id=lesson.id,
            type=ExerciseType.VIDEO_WATCH,
            order=1,
            sign_video_url=_media_url(f"education_words/24_sign/{word}/{videos[0]}"),
            slow_mo_video_url=_media_url(f"education_words/24_sign/{word}/{videos[0]}"),
            options_json=None,
            correct_answer=word,
        )
        db.add(exercise)
    
    await db.commit()
    print(f"✓ Seeded Chapter 2 with {len(chapter_2_lessons)} lessons from local dataset")


async def seed_localhost_finger_spelling(db, force: bool = False) -> None:
    """Seed finger spelling sections using local dataset."""
    existing_sections = await db.scalar(select(func.count()).select_from(SpellingSection))
    
    if force and (existing_sections or 0) > 0:
        print("🗑️  Force flag set - clearing old Spelling data...")
        await db.execute("TRUNCATE TABLE spelling_exercises CASCADE")
        await db.execute("TRUNCATE TABLE drill_sets CASCADE")
        await db.execute("TRUNCATE TABLE spelling_sections CASCADE")
        await db.commit()
        existing_sections = 0
    
    if (existing_sections or 0) > 0:
        print("✓ Finger spelling sections already exist, skipping... (use --force to replace)")
        return
    
    # Get local dataset
    local_letters = _list_local_dataset("finger_spelling")
    print(f"📝 Found {len(local_letters)} letters/vowels/numbers in local dataset")
    
    # Create Consonants section
    consonants_dir = Path(settings.local_media_path) / "finger_spelling" / "Consonants"
    consonants = sorted([d.name for d in consonants_dir.iterdir() if d.is_dir()])[:10]
    
    if consonants:
        section = SpellingSection(
            title="Section A - Consonants",
            order=1,
            letters_covered=consonants,
        )
        db.add(section)
        await db.flush()
        
        # Create drill sets
        drill = DrillSet(
            section_id=section.id,
            title="Drill 1 - Learn Consonants",
            order=1,
        )
        db.add(drill)
        await db.flush()
        
        # Add spelling exercises
        for i, letter in enumerate(consonants[:5], 1):
            if letter in local_letters:
                videos = local_letters[letter][:1]
                exercise = SpellingExercise(
                    drill_set_id=drill.id,
                    type=SpellingExerciseType.LETTER_WATCH,
                    order=i,
                    letter=letter,
                    hand_shape_video_url=_media_url(f"finger_spelling/Consonants/{letter}/{videos[0]}"),
                    slow_mo_video_url=_media_url(f"finger_spelling/Consonants/{letter}/{videos[0]}"),
                    options_json=None,
                    correct_answer=letter,
                )
                db.add(exercise)
        
        await db.commit()
        print(f"✓ Seeded consonants section with {len(consonants)} letters")


async def main() -> None:
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Seed localhost with local dataset")
    parser.add_argument("--force", action="store_true", help="Force reseed by clearing existing data")
    args = parser.parse_args()
    
    async with AsyncSessionLocal() as session:
        print(f"🌍 Seeding localhost with local dataset from: {settings.local_media_path}")
        print(f"📌 Media Base URL: {settings.media_base_url}\n")
        
        if args.force:
            print("⚠️  Using --force flag: old data will be replaced\n")
        
        await seed_localhost_education_words(session, force=args.force)
        await seed_localhost_finger_spelling(session, force=args.force)
        
        print("\n✅ Localhost seeding complete!")


if __name__ == "__main__":
    asyncio.run(main())
