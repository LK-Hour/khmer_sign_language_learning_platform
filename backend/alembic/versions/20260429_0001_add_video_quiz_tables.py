"""add video quiz tables

Revision ID: 20260429_0001
Revises: 20260424_0002
Create Date: 2026-04-29
"""

from alembic import op
import sqlalchemy as sa


revision = "20260429_0001"
down_revision = "20260424_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "video_quizzes",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("quiz_type", sa.Enum("SIGN_LANGUAGE", "FINGER_SPELLING", name="video_quiz_type"), nullable=False),
        sa.Column("chapter_id", sa.UUID(), nullable=True),
        sa.Column("spelling_section_id", sa.UUID(), nullable=True),
        sa.Column("question_count", sa.Integer(), nullable=False),
        sa.Column("pass_threshold", sa.Integer(), nullable=False),
        sa.Column("time_limit_seconds", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["chapter_id"], ["chapters.id"]),
        sa.ForeignKeyConstraint(["spelling_section_id"], ["spelling_sections.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_video_quizzes_chapter_id"), "video_quizzes", ["chapter_id"], unique=False)
    op.create_index(op.f("ix_video_quizzes_is_active"), "video_quizzes", ["is_active"], unique=False)
    op.create_index(
        op.f("ix_video_quizzes_spelling_section_id"),
        "video_quizzes",
        ["spelling_section_id"],
        unique=False,
    )

    op.create_table(
        "video_quiz_questions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("quiz_id", sa.UUID(), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("video_url", sa.String(length=512), nullable=False),
        sa.Column("video_duration_seconds", sa.Integer(), nullable=True),
        sa.Column("prompt", sa.String(length=255), nullable=False),
        sa.Column(
            "question_type",
            sa.Enum("MULTIPLE_CHOICE", "INPUT", name="video_quiz_question_type"),
            nullable=False,
        ),
        sa.Column("correct_answer", sa.String(length=255), nullable=False),
        sa.Column("options", sa.JSON(), nullable=True),
        sa.Column("acceptable_answers", sa.JSON(), nullable=True),
        sa.Column("enable_similarity", sa.Boolean(), nullable=False),
        sa.Column("similarity_threshold", sa.Float(), nullable=True),
        sa.Column("explanation", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["quiz_id"], ["video_quizzes.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("quiz_id", "order", name="uq_video_quiz_questions_quiz_order"),
    )
    op.create_index(op.f("ix_video_quiz_questions_quiz_id"), "video_quiz_questions", ["quiz_id"], unique=False)
    op.create_index(op.f("ix_video_quiz_questions_order"), "video_quiz_questions", ["order"], unique=False)

    op.create_table(
        "video_quiz_attempts",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("quiz_id", sa.UUID(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("IN_PROGRESS", "COMPLETED", name="video_quiz_attempt_status"),
            nullable=False,
        ),
        sa.Column("score_percent", sa.Integer(), nullable=False),
        sa.Column("time_spent_seconds", sa.Integer(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("passed", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["quiz_id"], ["video_quizzes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_video_quiz_attempts_user_id"), "video_quiz_attempts", ["user_id"], unique=False)
    op.create_index(op.f("ix_video_quiz_attempts_quiz_id"), "video_quiz_attempts", ["quiz_id"], unique=False)

    op.create_table(
        "video_quiz_responses",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("attempt_id", sa.UUID(), nullable=False),
        sa.Column("question_id", sa.UUID(), nullable=False),
        sa.Column("user_answer", sa.String(length=255), nullable=True),
        sa.Column("normalized_user_answer", sa.String(length=255), nullable=True),
        sa.Column("is_correct", sa.Boolean(), nullable=False),
        sa.Column("similarity_score", sa.Float(), nullable=True),
        sa.Column("points_earned", sa.Integer(), nullable=False),
        sa.Column("answered_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["attempt_id"], ["video_quiz_attempts.id"]),
        sa.ForeignKeyConstraint(["question_id"], ["video_quiz_questions.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("attempt_id", "question_id", name="uq_video_quiz_responses_attempt_question"),
    )
    op.create_index(op.f("ix_video_quiz_responses_attempt_id"), "video_quiz_responses", ["attempt_id"], unique=False)
    op.create_index(op.f("ix_video_quiz_responses_question_id"), "video_quiz_responses", ["question_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_video_quiz_responses_question_id"), table_name="video_quiz_responses")
    op.drop_index(op.f("ix_video_quiz_responses_attempt_id"), table_name="video_quiz_responses")
    op.drop_table("video_quiz_responses")

    op.drop_index(op.f("ix_video_quiz_attempts_quiz_id"), table_name="video_quiz_attempts")
    op.drop_index(op.f("ix_video_quiz_attempts_user_id"), table_name="video_quiz_attempts")
    op.drop_table("video_quiz_attempts")

    op.drop_index(op.f("ix_video_quiz_questions_order"), table_name="video_quiz_questions")
    op.drop_index(op.f("ix_video_quiz_questions_quiz_id"), table_name="video_quiz_questions")
    op.drop_table("video_quiz_questions")

    op.drop_index(op.f("ix_video_quizzes_spelling_section_id"), table_name="video_quizzes")
    op.drop_index(op.f("ix_video_quizzes_is_active"), table_name="video_quizzes")
    op.drop_index(op.f("ix_video_quizzes_chapter_id"), table_name="video_quizzes")
    op.drop_table("video_quizzes")
