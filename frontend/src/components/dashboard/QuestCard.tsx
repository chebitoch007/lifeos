"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { DIFFICULTY_COLORS, STAT_COLORS } from "@/lib/constants"
import type { Quest } from "@/lib/types"

interface QuestCardProps {
  quest: Quest
  onComplete: () => Promise<void>
  onAbandon: () => Promise<void>
}

export default function QuestCard({ quest, onComplete, onAbandon }: QuestCardProps) {
  const [completing, setCompleting] = useState(false)
  const [abandoning, setAbandoning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const diff = DIFFICULTY_COLORS[quest.difficulty]
  const statColor = STAT_COLORS[quest.stat_name]

  async function handleComplete() {
    setCompleting(true)
    setError(null)
    try {
      await onComplete()
    } catch {
      setError("Failed to complete quest.")
    } finally {
      setCompleting(false)
    }
  }

  async function handleAbandon() {
    setAbandoning(true)
    setError(null)
    try {
      await onAbandon()
    } catch {
      setError("Failed to abandon quest.")
    } finally {
      setAbandoning(false)
    }
  }

  const isLegendary = quest.difficulty === "LEGENDARY"

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-[#0d0d1a] p-4 transition-all ${
        isLegendary ? "border-purple-400/40" : "border-slate-700/50"
      } ${isLegendary ? "shadow-[0_0_20px_rgba(168,85,247,0.2)]" : ""}`}
    >
      {isLegendary && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-purple-900/5" />
      )}

      <div className="relative space-y-3">
        {/* Header row */}
        <div className="flex flex-wrap items-start gap-2">
          <h3 className="flex-1 text-sm font-semibold text-white">{quest.title}</h3>
          <Badge
            className={`shrink-0 border text-xs ${diff.bg} ${diff.text} ${diff.border}`}
          >
            {quest.difficulty}
          </Badge>
        </div>

        {/* Description */}
        {quest.description && (
          <p className="text-xs text-slate-400 line-clamp-2">{quest.description}</p>
        )}

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-900/40 px-2.5 py-0.5 text-xs font-bold text-blue-300">
            +{quest.xp_reward} XP
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${statColor}18`,
              color: statColor,
              border: `1px solid ${statColor}40`,
            }}
          >
            {quest.stat_name}
          </span>
        </div>

        {/* Inline error */}
        {error !== null && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleComplete}
            disabled={completing || abandoning}
            className="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {completing ? "Completing…" : "Complete"}
          </button>
          <button
            onClick={handleAbandon}
            disabled={completing || abandoning}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
          >
            {abandoning ? "…" : "Abandon"}
          </button>
        </div>
      </div>
    </div>
  )
}
