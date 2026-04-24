"""sign language dataset videos

Revision ID: 20260424_0002
Revises: 20260424_0001
Create Date: 2026-04-24
"""

from alembic import op
import sqlalchemy as sa


revision = "20260424_0002"
down_revision = "20260424_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sign_language_dataset_videos",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("sign_label", sa.String(length=255), nullable=False),
        sa.Column("video_url", sa.String(length=512), nullable=False),
        sa.Column("holistic_landmarks_json", sa.Text(), nullable=True),
        sa.Column("source_contribution_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["source_contribution_id"], ["contributed_videos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_sign_language_dataset_videos_sign_label"),
        "sign_language_dataset_videos",
        ["sign_label"],
        unique=False,
    )
    op.create_index(
        op.f("ix_sign_language_dataset_videos_source_contribution_id"),
        "sign_language_dataset_videos",
        ["source_contribution_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_sign_language_dataset_videos_source_contribution_id"),
        table_name="sign_language_dataset_videos",
    )
    op.drop_index(
        op.f("ix_sign_language_dataset_videos_sign_label"),
        table_name="sign_language_dataset_videos",
    )
    op.drop_table("sign_language_dataset_videos")
