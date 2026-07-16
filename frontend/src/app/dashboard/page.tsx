import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import PlayerCard from "@/components/dashboard/PlayerCard"
import StatGrid from "@/components/dashboard/StatGrid"
import QuestList from "@/components/dashboard/QuestList"
import type { Quest, User, UserStat, XPSummary } from "@/lib/types"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session as any).user?.id as string | undefined

  const [statsRes, xpRes, questsRes] = await Promise.all([
    userId
      ? fetchWithAuth(`/api/users/${userId}/stats`, session)
      : fetchWithAuth("/api/users/me/stats", session),
    fetchWithAuth("/api/users/me/xp", session),
    fetchWithAuth("/api/quests?quest_status=ACTIVE", session),
  ])

  const stats: UserStat[] = statsRes.ok ? await statsRes.json() : []
  const xpSummary: XPSummary = xpRes.ok
    ? await xpRes.json()
    : { total_xp: 0, current_level: 1, xp_to_next_level: 100 }
  const quests: Quest[] = questsRes.ok ? await questsRes.json() : []

  const user: User = {
    id: userId ?? "",
    email: session.user?.email ?? "",
    display_name: session.user?.name ?? null,
    avatar_url: null,
    current_level: xpSummary.current_level,
    total_xp: xpSummary.total_xp,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accessToken = (session as any).accessToken as string ?? ""

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <DashboardHeader showNavLinks={true} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <PlayerCard user={user} xpSummary={xpSummary} />

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Character Stats
          </h2>
          <StatGrid stats={stats} />
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Today&apos;s Quests
          </h2>
          <QuestList initialQuests={quests} accessToken={accessToken} />
        </section>

        {/* Habits shortcut */}
        <Link
          href="/dashboard/habits"
          className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-[#0d0d1a] px-5 py-4 transition-colors hover:border-blue-500/30 hover:bg-[#0d0d22]"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <p className="text-sm font-semibold text-white">Track Habits</p>
              <p className="text-xs text-slate-500">Build daily and weekly routines</p>
            </div>
          </div>
          <span className="text-slate-500 text-sm">→</span>
        </Link>
      </main>
    </div>
  )
}
