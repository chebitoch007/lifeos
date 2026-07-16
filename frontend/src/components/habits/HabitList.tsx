"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import HabitCard from "./HabitCard"
import CreateHabitModal from "./CreateHabitModal"
import type { Habit } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

interface HabitListProps {
  habits: Habit[]
  accessToken: string
}

export default function HabitList({ habits, accessToken }: HabitListProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const handleDelete = useCallback(
    async (habitId: string): Promise<void> => {
      const res = await fetch(`${API_URL}/api/habits/${habitId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok && res.status !== 204) {
        const data = (await res.json()) as { detail?: string }
        throw new Error(data.detail ?? "Failed to delete habit.")
      }
      router.refresh()
    },
    [accessToken, router],
  )

  const handleSuccess = useCallback(() => {
    router.refresh()
  }, [router])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {habits.length} habit{habits.length !== 1 ? "s" : ""} tracked
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
        >
          + New Habit
        </button>
      </div>

      {/* Empty state */}
      {habits.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-12 gap-3">
          <span className="text-3xl">🌱</span>
          <p className="text-sm text-slate-500">
            No habits yet. Build your first routine.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-blue-600/20 border border-blue-500/30 px-4 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-600/30"
          >
            Create Habit
          </button>
        </div>
      )}

      {/* Habit grid */}
      {habits.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              accessToken={accessToken}
              onDelete={() => handleDelete(habit.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CreateHabitModal
          accessToken={accessToken}
          onSuccess={handleSuccess}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
