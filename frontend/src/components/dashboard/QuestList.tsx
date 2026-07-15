"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

import QuestCard from "./QuestCard"
import type { Quest } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

interface QuestListProps {
  quests: Quest[]
  accessToken: string
}

export default function QuestList({ quests, accessToken }: QuestListProps) {
  const router = useRouter()

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  }

  const handleComplete = useCallback(
    async (questId: string) => {
      await fetch(`${API_URL}/api/quests/${questId}/complete`, {
        method: "POST",
        headers: authHeaders,
      })
      router.refresh()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken],
  )

  const handleAbandon = useCallback(
    async (questId: string) => {
      await fetch(`${API_URL}/api/quests/${questId}/abandon`, {
        method: "POST",
        headers: authHeaders,
      })
      router.refresh()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken],
  )

  if (quests.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-700 py-12">
        <p className="text-center text-sm text-slate-500">
          No active quests. Create your first quest to begin your journey.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {quests.map((quest) => (
        <QuestCard
          key={quest.id}
          quest={quest}
          onComplete={() => handleComplete(quest.id)}
          onAbandon={() => handleAbandon(quest.id)}
        />
      ))}
    </div>
  )
}
