"use client"

import { useState } from "react"
import type { HabitFrequency, StatName } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const STAT_OPTIONS: StatName[] = [
  "FITNESS", "CODING", "LEARNING", "FINANCES", "COMMUNICATION", "DISCIPLINE",
]

const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
]

interface CreateHabitModalProps {
  accessToken: string
  onSuccess: () => void
  onClose: () => void
}

export default function CreateHabitModal({
  accessToken,
  onSuccess,
  onClose,
}: CreateHabitModalProps) {
  const [title, setTitle] = useState("")
  const [statName, setStatName] = useState<StatName>("FITNESS")
  const [frequency, setFrequency] = useState<HabitFrequency>("DAILY")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/api/habits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          stat_name: statName,
          frequency,
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { detail?: string }
        setError(data.detail ?? "Failed to create habit.")
        return
      }

      onSuccess()
      onClose()
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
  const labelClass = "block text-xs font-medium text-slate-400 mb-1"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-700/60 bg-[#0d0d1a] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">New Habit</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="h-title" className={labelClass}>
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="h-title"
              type="text"
              required
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g. Morning run"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="h-stat" className={labelClass}>Stat</label>
              <select
                id="h-stat"
                value={statName}
                onChange={(e) => setStatName(e.target.value as StatName)}
                className={inputClass}
              >
                {STAT_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="h-freq" className={labelClass}>Frequency</label>
              <select
                id="h-freq"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
                className={inputClass}
              >
                {FREQUENCY_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {error !== null && (
            <p className="rounded-lg border border-red-500/30 bg-red-900/20 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 py-2 text-sm font-medium text-slate-400 hover:border-slate-500 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
