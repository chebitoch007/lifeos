"use client"

import type { QuestStatus } from "@/lib/types"

const TABS: { label: string; value: QuestStatus }[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Abandoned", value: "ABANDONED" },
]

interface QuestFilterProps {
  current: QuestStatus
  onChange: (status: QuestStatus) => void
}

export default function QuestFilter({ current, onChange }: QuestFilterProps) {
  return (
    <div className="flex gap-1 rounded-lg border border-slate-700/60 bg-slate-900/40 p-1">
      {TABS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            current === value
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
