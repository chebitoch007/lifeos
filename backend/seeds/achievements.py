from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# ---------------------------------------------------------------------------
# Achievement definitions
# ---------------------------------------------------------------------------

ACHIEVEMENT_DEFS = [
    {
        "key": "first_quest",
        "title": "First Steps",
        "description": "Complete your first quest",
        "xp_bonus": 50,
        "icon": "🎯",
    },
    {
        "key": "quest_10",
        "title": "Quest Hunter",
        "description": "Complete 10 quests",
        "xp_bonus": 150,
        "icon": "⚔️",
    },
    {
        "key": "quest_50",
        "title": "Quest Master",
        "description": "Complete 50 quests",
        "xp_bonus": 500,
        "icon": "👑",
    },
    {
        "key": "xp_100",
        "title": "Spark",
        "description": "Earn 100 XP",
        "xp_bonus": 25,
        "icon": "⚡",
    },
    {
        "key": "xp_1000",
        "title": "Charged",
        "description": "Earn 1,000 XP",
        "xp_bonus": 100,
        "icon": "🔋",
    },
    {
        "key": "xp_10000",
        "title": "Legendary Power",
        "description": "Earn 10,000 XP",
        "xp_bonus": 1000,
        "icon": "💎",
    },
    {
        "key": "level_5",
        "title": "Rising Hero",
        "description": "Reach Level 5",
        "xp_bonus": 200,
        "icon": "🌟",
    },
    {
        "key": "level_10",
        "title": "Master Class",
        "description": "Reach Level 10",
        "xp_bonus": 500,
        "icon": "🏆",
    },
    {
        "key": "streak_7",
        "title": "Week Warrior",
        "description": "Maintain a 7-day streak",
        "xp_bonus": 100,
        "icon": "🔥",
    },
    {
        "key": "streak_30",
        "title": "Monthly Legend",
        "description": "Maintain a 30-day streak",
        "xp_bonus": 500,
        "icon": "🗓️",
    },
    {
        "key": "all_stats",
        "title": "Renaissance",
        "description": "Get all 6 stats above 10",
        "xp_bonus": 300,
        "icon": "🎭",
    },
    {
        "key": "first_habit",
        "title": "Creature of Habit",
        "description": "Create your first habit",
        "xp_bonus": 50,
        "icon": "🌱",
    },
]


async def seed_achievements(db: AsyncSession) -> None:
    """Insert all achievement definitions. ON CONFLICT DO NOTHING makes this idempotent."""
    for a in ACHIEVEMENT_DEFS:
        await db.execute(
            text(
                """
                INSERT INTO achievements (id, key, title, description, xp_bonus, icon)
                VALUES (gen_random_uuid(), :key, :title, :description, :xp_bonus, :icon)
                ON CONFLICT (key) DO NOTHING
                """
            ),
            {
                "key": a["key"],
                "title": a["title"],
                "description": a["description"],
                "xp_bonus": a["xp_bonus"],
                "icon": a["icon"],
            },
        )
    await db.commit()
