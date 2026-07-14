"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-07-14 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Enums -----------------------------------------------------------
    stat_name_enum = postgresql.ENUM(
        "FITNESS", "CODING", "LEARNING", "FINANCES", "COMMUNICATION", "DISCIPLINE",
        name="stat_name_enum",
        create_type=True,
    )
    quest_difficulty_enum = postgresql.ENUM(
        "EASY", "MEDIUM", "HARD", "LEGENDARY",
        name="quest_difficulty_enum",
        create_type=True,
    )
    quest_status_enum = postgresql.ENUM(
        "ACTIVE", "COMPLETED", "ABANDONED",
        name="quest_status_enum",
        create_type=True,
    )
    habit_frequency_enum = postgresql.ENUM(
        "DAILY", "WEEKLY",
        name="habit_frequency_enum",
        create_type=True,
    )
    goal_status_enum = postgresql.ENUM(
        "ACTIVE", "COMPLETED", "ABANDONED",
        name="goal_status_enum",
        create_type=True,
    )

    # --- users -----------------------------------------------------------
    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("display_name", sa.String(100), nullable=True),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("current_level", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("total_xp", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # --- user_stats ------------------------------------------------------
    op.create_table(
        "user_stats",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(stat_name_enum, nullable=False, name="stat_name"),
        sa.Column("current_value", sa.Float(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_stats_user_id", "user_stats", ["user_id"])

    # --- achievements ----------------------------------------------------
    op.create_table(
        "achievements",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("key", sa.String(100), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("xp_bonus", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("icon", sa.String(100), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_achievements_key", "achievements", ["key"], unique=True)

    # --- quests ----------------------------------------------------------
    op.create_table(
        "quests",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(stat_name_enum, nullable=False, name="stat_name"),
        sa.Column("xp_reward", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(quest_difficulty_enum, nullable=False, name="difficulty"),
        sa.Column(quest_status_enum, nullable=False, server_default="ACTIVE", name="status"),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_quests_user_id", "quests", ["user_id"])

    # --- xp_events -------------------------------------------------------
    op.create_table(
        "xp_events",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_type", sa.String(100), nullable=False),
        sa.Column("source_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("xp_amount", sa.Integer(), nullable=False),
        sa.Column(stat_name_enum, nullable=True, name="stat_name"),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_xp_events_user_id", "xp_events", ["user_id"])

    # --- habits ----------------------------------------------------------
    op.create_table(
        "habits",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column(stat_name_enum, nullable=False, name="stat_name"),
        sa.Column(habit_frequency_enum, nullable=False, name="frequency"),
        sa.Column("current_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("longest_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_completed_date", sa.Date(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_habits_user_id", "habits", ["user_id"])

    # --- habit_logs ------------------------------------------------------
    op.create_table(
        "habit_logs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("habit_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("completed_date", sa.Date(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["habit_id"], ["habits.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_habit_logs_habit_id", "habit_logs", ["habit_id"])
    op.create_index("ix_habit_logs_user_id", "habit_logs", ["user_id"])

    # --- user_achievements -----------------------------------------------
    op.create_table(
        "user_achievements",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("achievement_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "earned_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["achievement_id"], ["achievements.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_achievements_user_id", "user_achievements", ["user_id"])
    op.create_index("ix_user_achievements_achievement_id", "user_achievements", ["achievement_id"])

    # --- goals -----------------------------------------------------------
    op.create_table(
        "goals",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(stat_name_enum, nullable=True, name="stat_name"),
        sa.Column("target_value", sa.Float(), nullable=True),
        sa.Column("current_value", sa.Float(), nullable=False, server_default="0"),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column(goal_status_enum, nullable=False, server_default="ACTIVE", name="status"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_goals_user_id", "goals", ["user_id"])

    # --- activity_logs ---------------------------------------------------
    op.create_table(
        "activity_logs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(100), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("metadata", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_activity_logs_user_id", "activity_logs", ["user_id"])


def downgrade() -> None:
    op.drop_table("activity_logs")
    op.drop_table("goals")
    op.drop_table("user_achievements")
    op.drop_table("habit_logs")
    op.drop_table("habits")
    op.drop_table("xp_events")
    op.drop_table("quests")
    op.drop_table("achievements")
    op.drop_table("user_stats")
    op.drop_table("users")

    # Drop enums
    for enum_name in (
        "goal_status_enum",
        "habit_frequency_enum",
        "quest_status_enum",
        "quest_difficulty_enum",
        "stat_name_enum",
    ):
        op.execute(f"DROP TYPE IF EXISTS {enum_name}")
