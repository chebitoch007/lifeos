"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { STAT_COLORS } from "@/lib/constants"
import type { Habit } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

interface HabitCardProps {
  habit: Habit
  accessToken: string
  onDelete: () => Promise<void>
}

function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD in UTC
}

export default function HabitCard({ habit, accessToken, onDelete }: HabitCardProps) {
  const router = useRouter()
  const [logging, setLogging] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const todayUTC = getTodayUTC()
  const alreadyLoggedToday =
    habit.frequency === "DAILY"
      ? habit.last_completed_date === todayUTC
      : false

  const statColor = STAT_COLORS[habit.stat_name]

  async function handleLog() {
    setLogging(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/habits/${habit.id}/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const data = (await res.json()) as { detail?: string }
        setError(data.detail ?? "Failed to log habit.")
      } else {
        router.refresh()
      }
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setLogging(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      await onDelete()
    } catch {
      setError("Failed to delete habit.")
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-[#0d0d1a] p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">{habit.title}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Stat tag */}
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${statColor}18`,
                color: statColor,
                border: `1px solid ${statColor}40`,
              }}
            >
              {habit.stat_name}
            </span>
            {/* Frequency badge */}
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {habit.frequency}
            </span>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`shrink-0 rounded-lg border px-2 py-1 text-xs transition-colors disabled:opacity-50 ${
            confirmDelete
              ? "border-red-500/60 bg-red-900/20 text-red-400 hover:bg-red-900/40"
              : "border-slate-700 text-slate-500 hover:border-red-500/40 hover:text-red-400"
          }`}
          onBlur={() => setConfirmDelete(false)}
        >
          {deleting ? "…" : confirmDelete ? "Confirm?" : "✕"}
        </button>
      </div>

      {/* Streak display */}
      <div className="flex items-center gap-2">
        {habit.current_streak > 0 ? (
          <>
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-lg font-bold text-white leading-none">
                {habit.current_streak}
              </p>
              <p className="text-xs text-slate-500">day streak</p>
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-500 italic">Start your streak</p>
        )}
      </div>

      {/* Error */}
      {error !== null && <p className="text-xs text-red-400">{error}</p>}

      {/* Log button */}
      <button
        onClick={handleLog}
        disabled={alreadyLoggedToday || logging}
        className={`w-full rounded-lg py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
          alreadyLoggedToday
            ? "bg-green-900/30 text-green-400 border border-green-500/30 cursor-default"
            : "bg-blue-600 text-white hover:bg-blue-500"
        }`}
      >
        {alreadyLoggedToday ? "✓ Done" : logging ? "Logging…" : "Log Today"}
      </button>
    </div>
  )
}
