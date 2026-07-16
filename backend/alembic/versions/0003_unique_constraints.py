"""unique constraints for user_stats and habit_logs

Revision ID: 0003_unique_constraints
Revises: 0002_seed_achievements
Create Date: 2026-07-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0003_unique_constraints"
down_revision: Union[str, None] = "0002_seed_achievements"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint(
        "uq_user_stats_user_stat",
        "user_stats",
        ["user_id", "stat_name"],
    )
    op.create_unique_constraint(
        "uq_habit_log_date",
        "habit_logs",
        ["habit_id", "completed_date"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_habit_log_date", "habit_logs")
    op.drop_constraint("uq_user_stats_user_stat", "user_stats")
