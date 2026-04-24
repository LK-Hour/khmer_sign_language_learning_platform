"""finger spelling dataset images

Revision ID: 20260424_0001
Revises: 20260421_0001
Create Date: 2026-04-24
"""

from alembic import op
import sqlalchemy as sa


revision = "20260424_0001"
down_revision = "20260421_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "finger_spelling_dataset_images",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("letter", sa.String(length=8), nullable=False),
        sa.Column("image_url", sa.String(length=512), nullable=False),
        sa.Column("hand_landmarks_json", sa.Text(), nullable=True),
        sa.Column("source_contribution_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["source_contribution_id"], ["contributed_videos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_finger_spelling_dataset_images_letter"),
        "finger_spelling_dataset_images",
        ["letter"],
        unique=False,
    )
    op.create_index(
        op.f("ix_finger_spelling_dataset_images_source_contribution_id"),
        "finger_spelling_dataset_images",
        ["source_contribution_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_finger_spelling_dataset_images_source_contribution_id"),
        table_name="finger_spelling_dataset_images",
    )
    op.drop_index(
        op.f("ix_finger_spelling_dataset_images_letter"),
        table_name="finger_spelling_dataset_images",
    )
    op.drop_table("finger_spelling_dataset_images")
