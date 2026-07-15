"use client"

import {
  BookOpen,
  Code2,
  Dumbbell,
  MessageSquare,
  Shield,
  TrendingUp,
} from "lucide-react"

import { STAT_COLORS, STAT_GLOW_COLORS } from "@/lib/constants"
import type { StatName, UserStat } from "@/lib/types"

const STAT_ICONS: Record<StatName, React.ElementType> = {
  FITNESS: Dumbbell,
  CODING: Code2,
  LEARNING: BookOpen,
  FINANCES: TrendingUp,
  COMMUNICATION: MessageSquare,
  DISCIPLINE: Shield,
}

const STAT_LABELS: Record<StatName, string> = {
  FITNESS: "Fitness",
  CODING: "Coding",
  LEARNING: "Learning",
  FINANCES: "Finances",
  COMMUNICATION: "Comm.",
  DISCIPLINE: "Discipline",
}

interface StatCardProps {
  stat: UserStat
}

export default function StatCard({ stat }: StatCardProps) {
  const color = STAT_COLORS[stat.stat_name]
  const glow = STAT_GLOW_COLORS[stat.stat_name]
  const Icon = STAT_ICONS[stat.stat_name]
  const label = STAT_LABELS[stat.stat_name]

  return (
    <div
      className="relative overflow-hidden rounded-xl border bg-[#0d0d1a] p-4 transition-transform hover:scale-[1.02]"
      style={{
        borderColor: `${color}30`,
        boxShadow: `0 0 16px ${glow}`,
      }}
    >
      {/* Background tint */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex flex-col items-center gap-2 text-center">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon size={20} />
        </div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p
          className="text-3xl font-bold tabular-nums"
          style={{ color }}
        >
          {Math.floor(stat.current_value)}
        </p>
      </div>
    </div>
  )
}
