"""seed achievements

Revision ID: 0002_seed_achievements
Revises: 0001_initial_schema
Create Date: 2026-07-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0002_seed_achievements"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Achievement seed data — pure SQL, no Python model imports
_ACHIEVEMENTS = [
    ("first_quest", "First Steps", "Complete your first quest", 50, "🎯"),
    ("quest_10", "Quest Hunter", "Complete 10 quests", 150, "⚔️"),
    ("quest_50", "Quest Master", "Complete 50 quests", 500, "👑"),
    ("xp_100", "Spark", "Earn 100 XP", 25, "⚡"),
    ("xp_1000", "Charged", "Earn 1,000 XP", 100, "🔋"),
    ("xp_10000", "Legendary Power", "Earn 10,000 XP", 1000, "💎"),
    ("level_5", "Rising Hero", "Reach Level 5", 200, "🌟"),
    ("level_10", "Master Class", "Reach Level 10", 500, "🏆"),
    ("streak_7", "Week Warrior", "Maintain a 7-day streak", 100, "🔥"),
    ("streak_30", "Monthly Legend", "Maintain a 30-day streak", 500, "🗓️"),
    ("all_stats", "Renaissance", "Get all 6 stats above 10", 300, "🎭"),
    ("first_habit", "Creature of Habit", "Create your first habit", 50, "🌱"),
]


def upgrade() -> None:
    conn = op.get_bind()
    for key, title, description, xp_bonus, icon in _ACHIEVEMENTS:
        conn.execute(
            __import__("sqlalchemy").text(
                """
                INSERT INTO achievements (id, key, title, description, xp_bonus, icon)
                VALUES (gen_random_uuid(), :key, :title, :description, :xp_bonus, :icon)
                ON CONFLICT (key) DO NOTHING
                """
            ),
            {
                "key": key,
                "title": title,
                "description": description,
                "xp_bonus": xp_bonus,
                "icon": icon,
            },
        )


def downgrade() -> None:
    # Seed data is not reversible
    pass
