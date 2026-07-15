import type { StatName } from "./types"

// ---------------------------------------------------------------------------
// Stat color palette
// ---------------------------------------------------------------------------

export const STAT_COLORS: Record<StatName, string> = {
  FITNESS: "#ef4444",
  CODING: "#3b82f6",
  LEARNING: "#8b5cf6",
  FINANCES: "#22c55e",
  COMMUNICATION: "#f59e0b",
  DISCIPLINE: "#06b6d4",
}

export const STAT_GLOW_COLORS: Record<StatName, string> = {
  FITNESS: "rgba(239,68,68,0.3)",
  CODING: "rgba(59,130,246,0.3)",
  LEARNING: "rgba(139,92,246,0.3)",
  FINANCES: "rgba(34,197,94,0.3)",
  COMMUNICATION: "rgba(245,158,11,0.3)",
  DISCIPLINE: "rgba(6,182,212,0.3)",
}

// ---------------------------------------------------------------------------
// Difficulty colors
// ---------------------------------------------------------------------------

export const DIFFICULTY_COLORS = {
  EASY: { bg: "bg-green-900/40", text: "text-green-400", border: "border-green-500/40" },
  MEDIUM: { bg: "bg-yellow-900/40", text: "text-yellow-400", border: "border-yellow-500/40" },
  HARD: { bg: "bg-orange-900/40", text: "text-orange-400", border: "border-orange-500/40" },
  LEGENDARY: { bg: "bg-purple-900/40", text: "text-purple-300", border: "border-purple-400/60" },
} as const

// ---------------------------------------------------------------------------
// Rank titles by level
// ---------------------------------------------------------------------------

export function getRankTitle(level: number): string {
  if (level <= 2) return "Novice"
  if (level <= 4) return "Apprentice"
  if (level <= 6) return "Adept"
  if (level <= 9) return "Expert"
  return "Master"
}

// ---------------------------------------------------------------------------
// XP curve — mirrors backend recalculate_level()
// ---------------------------------------------------------------------------

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900]

export function xpForLevel(level: number): number {
  if (level <= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[level - 1] ?? 0
  }
  let accumulated = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]!
  for (let lvl = LEVEL_THRESHOLDS.length + 1; lvl <= level; lvl++) {
    accumulated += lvl * 300
  }
  return accumulated
}

// ---------------------------------------------------------------------------
// Chart colors (analytics page)
// ---------------------------------------------------------------------------

export const CHART_COLORS = {
  xpLine: "#3b82f6",       // blue
  xpArea: "rgba(59,130,246,0.15)",
  radarFill: "rgba(59,130,246,0.25)",
  radarStroke: "#3b82f6",
  donutCompleted: "#22c55e",
  donutAbandoned: "#ef4444",
  donutActive: "#3b82f6",
  gridLines: "#1e293b",    // slate-800
  axisText: "#94a3b8",     // slate-400
  tooltipBg: "#0d0d1a",
  tooltipBorder: "#1e293b",
} as const
