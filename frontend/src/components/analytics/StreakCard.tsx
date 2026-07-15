"use client"

import type { StreakSummary } from "@/lib/types"

interface StreakCardProps {
  data: StreakSummary
}

export default function StreakCard({ data }: StreakCardProps) {
  const { current_streak, longest_streak, active_habits } = data

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Current streak */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-orange-500/20 bg-[#0d0d1a] p-5 text-center">
        <span className="mb-1 text-3xl">🔥</span>
        <p className="text-3xl font-bold text-white">{current_streak}</p>
        <p className="mt-1 text-xs text-slate-400">Current Streak</p>
        <p className="text-xs text-slate-500">days</p>
      </div>

      {/* Longest streak */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-yellow-500/20 bg-[#0d0d1a] p-5 text-center">
        <span className="mb-1 text-3xl">⚡</span>
        <p className="text-3xl font-bold text-white">{longest_streak}</p>
        <p className="mt-1 text-xs text-slate-400">Longest Streak</p>
        <p className="text-xs text-slate-500">days</p>
      </div>

      {/* Active habits */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-blue-500/20 bg-[#0d0d1a] p-5 text-center">
        <span className="mb-1 text-3xl">📋</span>
        <p className="text-3xl font-bold text-white">{active_habits}</p>
        <p className="mt-1 text-xs text-slate-400">Active Habits</p>
        <p className="text-xs text-slate-500">tracked</p>
      </div>
    </div>
  )
}
