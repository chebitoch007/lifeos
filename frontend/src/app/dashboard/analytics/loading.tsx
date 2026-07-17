export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 border-b border-slate-800/60 bg-[#0a0a0f]/90 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="h-6 w-20 animate-pulse rounded-md bg-slate-800/50" />
          <div className="h-7 w-16 animate-pulse rounded-lg bg-slate-800/50" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {/* Back + heading */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-800/50" />
          <div className="h-8 w-28 animate-pulse rounded-lg bg-slate-800/50" />
        </div>

        {/* XP line chart skeleton */}
        <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-800/50" />

        {/* Radar + Donut skeletons */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-2xl bg-slate-800/50" />
          <div className="h-48 animate-pulse rounded-2xl bg-slate-800/50" />
        </div>

        {/* Streak card skeleton */}
        <div className="h-24 w-full animate-pulse rounded-xl bg-slate-800/50" />
      </div>
    </div>
  )
}
