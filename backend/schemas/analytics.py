from pydantic import BaseModel


class XPDataPoint(BaseModel):
    date: str
    xp: int


class StatDistributionItem(BaseModel):
    stat_name: str
    value: float


class QuestCompletionRate(BaseModel):
    total: int
    completed: int
    abandoned: int
    completion_rate: float


class StreakSummary(BaseModel):
    longest_streak: int
    current_streak: int
    active_habits: int
