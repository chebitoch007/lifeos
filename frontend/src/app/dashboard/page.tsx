import { redirect } from "next/navigation"
import { LogOut } from "lucide-react"

import { auth, signOut } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import PlayerCard from "@/components/dashboard/PlayerCard"
import StatGrid from "@/components/dashboard/StatGrid"
import QuestList from "@/components/dashboard/QuestList"
import type { Quest, User, UserStat, XPSummary } from "@/lib/types"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Parallel data fetching
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session as any).user?.id as string | undefined

  const [statsRes, xpRes, questsRes] = await Promise.all([
    userId
      ? fetchWithAuth(`/api/users/${userId}/stats`, session)
      : fetchWithAuth("/api/users/me/stats", session),
    fetchWithAuth("/api/users/me/xp", session),
    fetchWithAuth("/api/quests?status=ACTIVE", session),
  ])

  // Graceful fallbacks if a fetch fails
  const stats: UserStat[] = statsRes.ok ? await statsRes.json() : []
  const xpSummary: XPSummary = xpRes.ok
    ? await xpRes.json()
    : { total_xp: 0, current_level: 1, xp_to_next_level: 100 }
  const quests: Quest[] = questsRes.ok ? await questsRes.json() : []

  // Build a minimal User from session + xp data
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
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-slate-800/60 bg-[#0a0a0f]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            LifeOS
          </span>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {/* Player identity block */}
        <PlayerCard user={user} xpSummary={xpSummary} />

        {/* Stats */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Character Stats
          </h2>
          <StatGrid stats={stats} />
        </section>

        {/* Quests */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Today&apos;s Quests
          </h2>
          <QuestList initialQuests={quests} accessToken={accessToken} />
        </section>
      </main>
    </div>
  )
}
