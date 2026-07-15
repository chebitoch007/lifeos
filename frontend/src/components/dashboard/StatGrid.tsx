import StatCard from "./StatCard"
import type { UserStat } from "@/lib/types"

interface StatGridProps {
  stats: UserStat[]
}

export default function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  )
}
