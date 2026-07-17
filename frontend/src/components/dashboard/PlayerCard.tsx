"use client"

import { Progress } from "@/components/ui/progress"
import { getRankTitle, xpForLevel } from "@/lib/constants"
import type { User, XPSummary } from "@/lib/types"

interface PlayerCardProps {
  user: User
  xpSummary: XPSummary
}

export default function PlayerCard({ user, xpSummary }: PlayerCardProps) {
  const { total_xp, current_level } = xpSummary
  const rankTitle = getRankTitle(current_level)

  // Accurate XP progress using the shared curve from constants
  const xpStart = xpForLevel(current_level)
  const xpEnd = xpForLevel(current_level + 1)
  const progressPct = Math.min(
    100,
    Math.round(((total_xp - xpStart) / (xpEnd - xpStart)) * 100),
  )
  const xpToNext = Math.max(0, xpEnd - total_xp)

  const displayName = user.display_name ?? user.email

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-[#0d0d1a] p-6 glow-blue">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        {/* Avatar placeholder */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-blue-500/50 bg-blue-900/30 text-3xl font-bold text-blue-400">
          {displayName.charAt(0).toUpperCase()}
        </div>

        {/* Identity block */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {displayName}
            </h2>
            <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-sm font-bold text-white">
              LVL {current_level}
            </span>
            <span className="text-sm font-medium text-blue-300/80">{rankTitle}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{total_xp.toLocaleString()} XP</span>
              <span>{xpToNext.toLocaleString()} XP to next level</span>
            </div>
            <Progress
              value={progressPct}
              className="h-2 bg-blue-950/60 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
