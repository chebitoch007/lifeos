import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/api"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import HabitList from "@/components/habits/HabitList"
import type { Habit } from "@/lib/types"

export default async function HabitsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const habitsRes = await fetchWithAuth("/api/habits", session)
  const habits: Habit[] = habitsRes.ok ? await habitsRes.json() : []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accessToken = (session as any).accessToken as string ?? ""

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
          <h1 className="text-2xl font-bold text-white">Habits</h1>
        </div>

        <HabitList habits={habits} accessToken={accessToken} />
      </main>
    </div>
  )
}
