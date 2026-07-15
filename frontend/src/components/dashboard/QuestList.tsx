"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import QuestCard from "./QuestCard"
import QuestFilter from "./QuestFilter"
import CreateQuestModal from "./CreateQuestModal"
import XPToast, { useXPToast } from "./XPToast"
import type { Quest, QuestStatus } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

interface QuestListProps {
  initialQuests: Quest[]
  accessToken: string
}

export default function QuestList({ initialQuests, accessToken }: QuestListProps) {
  const router = useRouter()
  const [quests, setQuests] = useState<Quest[]>(initialQuests)
  const [filter, setFilter] = useState<QuestStatus>("ACTIVE")
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const { toast, showXP, dismiss } = useXPToast()

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  }

  // Fetch quests when filter changes (skip initial — we have SSR data for ACTIVE)
  const fetchQuests = useCallback(
    async (status: QuestStatus) => {
      setLoading(true)
      setFetchError(null)
      try {
        const res = await fetch(`${API_URL}/api/quests?quest_status=${status}`, {
          headers: authHeaders,
        })
        if (!res.ok) throw new Error("Failed to fetch quests")
        const data = (await res.json()) as Quest[]
        setQuests(data)
      } catch {
        setFetchError("Could not load quests. Please refresh.")
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken],
  )

  useEffect(() => {
    // Initial ACTIVE quests come from SSR; only fetch on filter change
    if (filter !== "ACTIVE") {
      void fetchQuests(filter)
    } else {
      setQuests(initialQuests)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleFilterChange = (status: QuestStatus) => {
    setFilter(status)
  }

  const handleComplete = useCallback(
    async (quest: Quest): Promise<void> => {
      const res = await fetch(`${API_URL}/api/quests/${quest.id}/complete`, {
        method: "POST",
        headers: authHeaders,
      })
      if (!res.ok) {
        const data = (await res.json()) as { detail?: string }
        throw new Error(data.detail ?? "Failed to complete quest")
      }
      showXP(quest.xp_reward)
      // Remove from list optimistically, then refresh server data
      setQuests((prev) => prev.filter((q) => q.id !== quest.id))
      router.refresh()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken, showXP],
  )

  const handleAbandon = useCallback(
    async (quest: Quest): Promise<void> => {
      const res = await fetch(`${API_URL}/api/quests/${quest.id}/abandon`, {
        method: "POST",
        headers: authHeaders,
      })
      if (!res.ok) {
        const data = (await res.json()) as { detail?: string }
        throw new Error(data.detail ?? "Failed to abandon quest")
      }
      setQuests((prev) => prev.filter((q) => q.id !== quest.id))
      router.refresh()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken],
  )

  const handleModalSuccess = useCallback(() => {
    setFilter("ACTIVE")
    router.refresh()
    void fetchQuests("ACTIVE")
  }, [fetchQuests, router])

  return (
    <div className="space-y-4">
      {/* Header row: filter tabs + new quest button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <QuestFilter current={filter} onChange={handleFilterChange} />
        <button
          onClick={() => setShowModal(true)}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
        >
          + New Quest
        </button>
      </div>

      {/* Fetch error */}
      {fetchError !== null && (
        <p className="rounded-lg border border-red-500/30 bg-red-900/20 px-3 py-2 text-xs text-red-400">
          {fetchError}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-xl border border-slate-700/50 bg-slate-800/30"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && quests.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-12 gap-3">
          <p className="text-center text-sm text-slate-500">
            {filter === "ACTIVE"
              ? "No active quests. Create your first quest to begin your journey."
              : `No ${filter.toLowerCase()} quests yet.`}
          </p>
          {filter === "ACTIVE" && (
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-blue-600/20 border border-blue-500/30 px-4 py-2 text-xs font-semibold text-blue-400 transition-colors hover:bg-blue-600/30"
            >
              Create Quest
            </button>
          )}
        </div>
      )}

      {/* Quest grid */}
      {!loading && quests.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={() => handleComplete(quest)}
              onAbandon={() => handleAbandon(quest)}
            />
          ))}
        </div>
      )}

      {/* Create Quest Modal */}
      {showModal && (
        <CreateQuestModal
          accessToken={accessToken}
          onSuccess={handleModalSuccess}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* XP Toast */}
      <XPToast toast={toast} onDone={dismiss} />
    </div>
  )
}
