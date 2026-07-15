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
