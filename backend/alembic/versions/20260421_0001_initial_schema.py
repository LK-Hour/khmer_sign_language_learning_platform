"""initial schema

Revision ID: 20260421_0001
Revises:
Create Date: 2026-04-21
"""

from alembic import op
import sqlalchemy as sa


revision = "20260421_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=120), nullable=False),
        sa.Column("role", sa.Enum("LEARNER", "ADMIN", name="user_role"), nullable=False),
        sa.Column("timezone", sa.String(length=64), nullable=False),
        sa.Column("fcm_token", sa.String(length=255), nullable=True),
        sa.Column("consent_for_video_contribution", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "user_stats",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("current_streak", sa.Integer(), nullable=False),
        sa.Column("longest_streak", sa.Integer(), nullable=False),
        sa.Column("total_xp", sa.Integer(), nullable=False),
        sa.Column("last_active_date", sa.Date(), nullable=True),
        sa.Column("badges_json", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("user_id"),
    )

    op.create_table(
        "units",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("cover_image_url", sa.String(length=512), nullable=False),
        sa.Column("is_locked", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_units_order"), "units", ["order"], unique=False)

    op.create_table(
        "chapters",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("unit_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["unit_id"], ["units.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_chapters_order"), "chapters", ["order"], unique=False)
    op.create_index(op.f("ix_chapters_unit_id"), "chapters", ["unit_id"], unique=False)

    op.create_table(
        "lessons",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("chapter_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["chapter_id"], ["chapters.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_lessons_chapter_id"), "lessons", ["chapter_id"], unique=False)
    op.create_index(op.f("ix_lessons_order"), "lessons", ["order"], unique=False)

    op.create_table(
        "exercises",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("lesson_id", sa.UUID(), nullable=False),
        sa.Column(
            "type",
            sa.Enum(
                "VIDEO_WATCH",
                "SIGN_MATCH",
                "PICTURE_MATCH",
                "AI_PRACTICE",
                "DIALOGUE",
                name="exercise_type",
            ),
            nullable=False,
        ),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("sign_video_url", sa.String(length=512), nullable=False),
        sa.Column("slow_mo_video_url", sa.String(length=512), nullable=False),
        sa.Column("options_json", sa.Text(), nullable=True),
        sa.Column("correct_answer", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_exercises_lesson_id"), "exercises", ["lesson_id"], unique=False)
    op.create_index(op.f("ix_exercises_order"), "exercises", ["order"], unique=False)

    op.create_table(
        "spelling_sections",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("letters_covered_json", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_spelling_sections_order"), "spelling_sections", ["order"], unique=False)

    op.create_table(
        "drill_sets",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("section_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["section_id"], ["spelling_sections.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_drill_sets_order"), "drill_sets", ["order"], unique=False)
    op.create_index(op.f("ix_drill_sets_section_id"), "drill_sets", ["section_id"], unique=False)

    op.create_table(
        "spelling_exercises",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("drill_set_id", sa.UUID(), nullable=False),
        sa.Column(
            "type",
            sa.Enum(
                "LETTER_WATCH",
                "LETTER_MATCH",
                "AI_SPELL",
                "WORD_SPELL",
                name="spelling_exercise_type",
            ),
            nullable=False,
        ),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("letter", sa.String(length=8), nullable=True),
        sa.Column("word", sa.String(length=64), nullable=True),
        sa.Column("hand_shape_video_url", sa.String(length=512), nullable=False),
        sa.Column("slow_mo_video_url", sa.String(length=512), nullable=False),
        sa.Column("options_json", sa.Text(), nullable=True),
        sa.Column("correct_answer", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["drill_set_id"], ["drill_sets.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_spelling_exercises_drill_set_id"), "spelling_exercises", ["drill_set_id"], unique=False)
    op.create_index(op.f("ix_spelling_exercises_order"), "spelling_exercises", ["order"], unique=False)

    op.create_table(
        "user_progress",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("track", sa.Enum("SIGN_LANGUAGE", "FINGER_SPELLING", name="learning_track"), nullable=False),
        sa.Column("lesson_id", sa.UUID(), nullable=True),
        sa.Column("exercise_id", sa.UUID(), nullable=True),
        sa.Column("drill_set_id", sa.UUID(), nullable=True),
        sa.Column("spelling_exercise_id", sa.UUID(), nullable=True),
        sa.Column("score", sa.Numeric(5, 2), nullable=False),
        sa.Column("stars", sa.Integer(), nullable=False),
        sa.Column("retry_count", sa.Integer(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["drill_set_id"], ["drill_sets.id"]),
        sa.ForeignKeyConstraint(["exercise_id"], ["exercises.id"]),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"]),
        sa.ForeignKeyConstraint(["spelling_exercise_id"], ["spelling_exercises.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_progress_user_id"), "user_progress", ["user_id"], unique=False)

    op.create_table(
        "contributed_videos",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("track", sa.Enum("SIGN_LANGUAGE", "FINGER_SPELLING", name="contribution_track"), nullable=False),
        sa.Column("sign_label", sa.String(length=255), nullable=False),
        sa.Column("video_url", sa.String(length=512), nullable=False),
        sa.Column("consent_given", sa.Boolean(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("PENDING", "APPROVED", "REJECTED", name="contributed_video_status"),
            nullable=False,
        ),
        sa.Column("reviewed_by", sa.UUID(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_contributed_videos_user_id"), "contributed_videos", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_contributed_videos_user_id"), table_name="contributed_videos")
    op.drop_table("contributed_videos")
    op.drop_index(op.f("ix_user_progress_user_id"), table_name="user_progress")
    op.drop_table("user_progress")
    op.drop_index(op.f("ix_spelling_exercises_order"), table_name="spelling_exercises")
    op.drop_index(op.f("ix_spelling_exercises_drill_set_id"), table_name="spelling_exercises")
    op.drop_table("spelling_exercises")
    op.drop_index(op.f("ix_drill_sets_section_id"), table_name="drill_sets")
    op.drop_index(op.f("ix_drill_sets_order"), table_name="drill_sets")
    op.drop_table("drill_sets")
    op.drop_index(op.f("ix_spelling_sections_order"), table_name="spelling_sections")
    op.drop_table("spelling_sections")
    op.drop_index(op.f("ix_exercises_order"), table_name="exercises")
    op.drop_index(op.f("ix_exercises_lesson_id"), table_name="exercises")
    op.drop_table("exercises")
    op.drop_index(op.f("ix_lessons_order"), table_name="lessons")
    op.drop_index(op.f("ix_lessons_chapter_id"), table_name="lessons")
    op.drop_table("lessons")
    op.drop_index(op.f("ix_chapters_unit_id"), table_name="chapters")
    op.drop_index(op.f("ix_chapters_order"), table_name="chapters")
    op.drop_table("chapters")
    op.drop_index(op.f("ix_units_order"), table_name="units")
    op.drop_table("units")
    op.drop_table("user_stats")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
