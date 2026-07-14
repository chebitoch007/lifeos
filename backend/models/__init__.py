# Import all models here so SQLAlchemy's Base.metadata is fully populated
# when Alembic autogenerate runs or when the app starts.

from models.achievement import Achievement, UserAchievement
from models.activity_log import ActivityLog
from models.goal import Goal, GoalStatus
from models.habit import Habit, HabitFrequency, HabitLog
from models.quest import Quest, QuestDifficulty, QuestStatus
from models.stat import StatName, UserStat
from models.user import User
from models.xp_event import XPEvent

__all__ = [
    "Achievement",
    "UserAchievement",
    "ActivityLog",
    "Goal",
    "GoalStatus",
    "Habit",
    "HabitFrequency",
    "HabitLog",
    "Quest",
    "QuestDifficulty",
    "QuestStatus",
    "StatName",
    "UserStat",
    "User",
    "XPEvent",
]
