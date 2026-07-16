"use client"

import type { AchievementResponse } from "@/lib/types"

interface AchievementBadgeProps {
  achievement: AchievementResponse
  earnedAt?: string
}

export default function AchievementBadge({ achievement, earnedAt }: AchievementBadgeProps) {
  const isEarned = earnedAt !== undefined
  const earnedDate = earnedAt
    ? new Date(earnedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <div
      className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
        isEarned
          ? "border-blue-500/30 bg-[#0d0d1a] shadow-[0_0_12px_rgba(59,130,246,0.15)]"
          : "border-slate-800/60 bg-slate-900/20 opacity-40 grayscale"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
          isEarned ? "bg-blue-900/40" : "bg-slate-800/40"
        }`}
      >
        {isEarned ? achievement.icon : "?"}
      </div>

      {/* Title */}
      <p className={`text-sm font-semibold ${isEarned ? "text-white" : "text-slate-400"}`}>
        {achievement.title}
      </p>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-snug">{achievement.description}</p>

      {/* XP bonus */}
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
          isEarned ? "bg-blue-900/40 text-blue-300" : "bg-slate-800/40 text-slate-500"
        }`}
      >
        +{achievement.xp_bonus} XP
      </span>

      {/* Earned date */}
      {isEarned && earnedDate && (
        <p className="text-xs text-slate-500">Earned {earnedDate}</p>
      )}
    </div>
  )
}
