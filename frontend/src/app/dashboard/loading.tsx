export default function DashboardLoading() {
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
        {/* PlayerCard skeleton */}
        <div className="h-32 w-full animate-pulse rounded-2xl bg-slate-800/50" />

        {/* StatGrid skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-800/50" />
          ))}
        </div>

        {/* Quest list skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-800/50" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-800/50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
