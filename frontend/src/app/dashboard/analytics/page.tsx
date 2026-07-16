import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import XPLineChart from "@/components/analytics/XPLineChart"
import StatRadarChart from "@/components/analytics/StatRadarChart"
import QuestCompletionDonut from "@/components/analytics/QuestCompletionDonut"
import StreakCard from "@/components/analytics/StreakCard"
import type {
  QuestCompletionRate,
  StatDistribution,
  StreakSummary,
  XPDataPoint,
} from "@/lib/types"

const EMPTY_XP: XPDataPoint[] = []
const EMPTY_STATS: StatDistribution[] = []
const EMPTY_COMPLETION: QuestCompletionRate = {
  total: 0,
  completed: 0,
  abandoned: 0,
  completion_rate: 0,
}
const EMPTY_STREAK: StreakSummary = {
  longest_streak: 0,
  current_streak: 0,
  active_habits: 0,
}

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const [xpRes, statsRes, questRes, streakRes] = await Promise.all([
    fetchWithAuth("/api/analytics/xp-over-time?days=30", session),
    fetchWithAuth("/api/analytics/stat-distribution", session),
    fetchWithAuth("/api/analytics/quest-completion-rate?days=30", session),
    fetchWithAuth("/api/analytics/streak-summary", session),
  ])

  const xpData: XPDataPoint[] = xpRes.ok ? await xpRes.json() : EMPTY_XP
  const statData: StatDistribution[] = statsRes.ok ? await statsRes.json() : EMPTY_STATS
  const questData: QuestCompletionRate = questRes.ok ? await questRes.json() : EMPTY_COMPLETION
  const streakData: StreakSummary = streakRes.ok ? await streakRes.json() : EMPTY_STREAK

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <DashboardHeader showNavLinks={true} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {/* Page heading */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
          >
            <ArrowLeft size={13} />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
        </div>

        {/* XP over time — full width */}
        <section className="rounded-2xl border border-slate-800/60 bg-[#0d0d1a] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">XP Earned</h2>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
              Last 30 days
            </span>
          </div>
          <XPLineChart data={xpData} />
        </section>

        {/* Radar + Donut — 2 col on desktop */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800/60 bg-[#0d0d1a] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">Stat Distribution</h2>
            <StatRadarChart data={statData} />
          </section>

          <section className="rounded-2xl border border-slate-800/60 bg-[#0d0d1a] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Quest Completion</h2>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                Last 30 days
              </span>
            </div>
            <QuestCompletionDonut data={questData} />
            {questData.total > 0 && (
              <div className="mt-3 flex justify-center gap-4 text-xs text-slate-400">
                <span>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500" />
                  {questData.completed} completed
                </span>
                <span>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />
                  {questData.abandoned} abandoned
                </span>
                <span>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500" />
                  {questData.total - questData.completed - questData.abandoned} active
                </span>
              </div>
            )}
          </section>
        </div>

        {/* Streak summary — full width */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Habit Streaks
          </h2>
          <StreakCard data={streakData} />
        </section>
      </main>
    </div>
  )
}
