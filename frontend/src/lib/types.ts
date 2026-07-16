export type StatName =
  | "FITNESS"
  | "CODING"
  | "LEARNING"
  | "FINANCES"
  | "COMMUNICATION"
  | "DISCIPLINE"

export type QuestDifficulty = "EASY" | "MEDIUM" | "HARD" | "LEGENDARY"
export type QuestStatus = "ACTIVE" | "COMPLETED" | "ABANDONED"

export interface User {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  current_level: number
  total_xp: number
}

export interface UserStat {
  id: string
  user_id: string
  stat_name: StatName
  current_value: number
}

export interface Quest {
  id: string
  user_id: string
  title: string
  description: string | null
  stat_name: StatName
  xp_reward: number
  difficulty: QuestDifficulty
  status: QuestStatus
  due_date: string | null
  completed_at: string | null
}

export interface XPSummary {
  total_xp: number
  current_level: number
  xp_to_next_level: number
}

// Analytics types
export interface XPDataPoint {
  date: string
  xp: number
}

export interface StatDistribution {
  stat_name: StatName
  value: number
}

export interface QuestCompletionRate {
  total: number
  completed: number
  abandoned: number
  completion_rate: number
}

export interface StreakSummary {
  longest_streak: number
  current_streak: number
  active_habits: number
}

// Achievement types
export interface AchievementResponse {
  id: string
  key: string
  title: string
  description: string
  xp_bonus: number
  icon: string
}

export interface UserAchievementResponse {
  id: string
  achievement: AchievementResponse
  earned_at: string
}

// Habit types
export type HabitFrequency = "DAILY" | "WEEKLY"

export interface Habit {
  id: string
  user_id: string
  title: string
  stat_name: StatName
  frequency: HabitFrequency
  current_streak: number
  longest_streak: number
  last_completed_date: string | null
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
  created_at: string
}
