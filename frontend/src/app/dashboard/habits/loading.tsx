export default function HabitsLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-8 w-32 rounded-lg bg-slate-800/50 animate-pulse mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 w-full rounded-xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
