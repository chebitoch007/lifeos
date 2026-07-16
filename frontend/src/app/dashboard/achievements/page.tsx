import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import AchievementBadge from "@/components/dashboard/AchievementBadge"
import type { AchievementResponse, UserAchievementResponse } from "@/lib/types"

export default async function AchievementsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const [allRes, earnedRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/achievements`),
    fetchWithAuth("/api/users/me/achievements", session),
  ])

  const allAchievements: AchievementResponse[] = allRes.ok ? await allRes.json() : []
  const earnedAchievements: UserAchievementResponse[] = earnedRes.ok
    ? await earnedRes.json()
    : []

  // Build a map of key → earned_at for quick lookup
  const earnedMap = new Map<string, string>(
    earnedAchievements.map((ua) => [ua.achievement.key, ua.earned_at]),
  )

  // Sort: earned first, then locked
  const sorted = [...allAchievements].sort((a, b) => {
    const aEarned = earnedMap.has(a.key)
    const bEarned = earnedMap.has(b.key)
    if (aEarned && !bEarned) return -1
    if (!aEarned && bEarned) return 1
    return 0
  })

  const earnedCount = earnedMap.size
  const totalCount = allAchievements.length

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <DashboardHeader showAnalyticsLink={true} />

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
          <div>
            <h1 className="text-2xl font-bold text-white">Achievements</h1>
          </div>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-[#0d0d1a] px-5 py-4">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-lg font-bold text-white">
              {earnedCount}{" "}
              <span className="text-slate-400 font-normal">/ {totalCount} unlocked</span>
            </p>
            <div className="mt-1 h-1.5 w-48 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                style={{
                  width: totalCount > 0 ? `${(earnedCount / totalCount) * 100}%` : "0%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Achievement grid */}
        {sorted.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-12">
            No achievements defined yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {sorted.map((achievement) => (
              <AchievementBadge
                key={achievement.key}
                achievement={achievement}
                earnedAt={earnedMap.get(achievement.key)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
