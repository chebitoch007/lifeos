"use client"

import { useState } from "react"
import type { QuestDifficulty, StatName } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const STAT_OPTIONS: StatName[] = [
  "FITNESS",
  "CODING",
  "LEARNING",
  "FINANCES",
  "COMMUNICATION",
  "DISCIPLINE",
]

const DIFFICULTY_OPTIONS: QuestDifficulty[] = ["EASY", "MEDIUM", "HARD", "LEGENDARY"]

interface CreateQuestModalProps {
  accessToken: string
  onSuccess: () => void
  onClose: () => void
}

export default function CreateQuestModal({
  accessToken,
  onSuccess,
  onClose,
}: CreateQuestModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [statName, setStatName] = useState<StatName>("FITNESS")
  const [difficulty, setDifficulty] = useState<QuestDifficulty>("EASY")
  const [xpReward, setXpReward] = useState(50)
  const [dueDate, setDueDate] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        stat_name: statName,
        difficulty,
        xp_reward: xpReward,
      }
      if (description.trim()) body.description = description.trim()
      if (dueDate) body.due_date = new Date(dueDate).toISOString()

      const res = await fetch(`${API_URL}/api/quests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = (await res.json()) as { detail?: string }
        setError(data.detail ?? "Failed to create quest. Please try again.")
        return
      }

      onSuccess()
      onClose()
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40"

  const labelClass = "block text-xs font-medium text-slate-400 mb-1"

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Modal card */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/60 bg-[#0d0d1a] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Create Quest</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="q-title" className={labelClass}>
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="q-title"
              type="text"
              required
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g. Run 5km without stopping"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="q-desc" className={labelClass}>
              Description <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              id="q-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="What does completing this quest involve?"
            />
          </div>

          {/* Stat + Difficulty row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="q-stat" className={labelClass}>
                Stat
              </label>
              <select
                id="q-stat"
                value={statName}
                onChange={(e) => setStatName(e.target.value as StatName)}
                className={inputClass}
              >
                {STAT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="q-diff" className={labelClass}>
                Difficulty
              </label>
              <select
                id="q-diff"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuestDifficulty)}
                className={inputClass}
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* XP Reward + Due date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="q-xp" className={labelClass}>
                XP Reward
              </label>
              <input
                id="q-xp"
                type="number"
                min={10}
                max={1000}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="q-due" className={labelClass}>
                Due date <span className="text-slate-600">(optional)</span>
              </label>
              <input
                id="q-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>
          </div>

          {/* Error */}
          {error !== null && (
            <p className="rounded-lg border border-red-500/30 bg-red-900/20 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create Quest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
