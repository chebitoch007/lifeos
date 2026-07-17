"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0f] text-white">
      <p className="text-slate-400">Something went wrong.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 hover:border-slate-500 hover:text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

