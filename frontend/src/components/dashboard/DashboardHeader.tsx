import Link from "next/link"
import { BarChart2, LogOut, Trophy } from "lucide-react"

import { signOut } from "@/lib/auth"

interface DashboardHeaderProps {
  showAnalyticsLink?: boolean
}

export default function DashboardHeader({ showAnalyticsLink = true }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800/60 bg-[#0a0a0f]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              LifeOS
            </span>
          </Link>
          {showAnalyticsLink && (
            <>
              <Link
                href="/dashboard/analytics"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
              >
                <BarChart2 size={13} />
                Analytics
              </Link>
              <Link
                href="/dashboard/achievements"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
              >
                <Trophy size={13} />
                Achievements
              </Link>
            </>
          )}
        </div>

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
  )
}
