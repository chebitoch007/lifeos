"use client"

import { useEffect, useState } from "react"

interface ToastProps {
  message: string
  onDone: () => void
}

export default function Toast({ message, onDone }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), 2000)
    const doneTimer = setTimeout(() => onDone(), 2500)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-blue-500/40 bg-[#0d0d1a] px-5 py-3 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <span className="text-lg">⚡</span>
      <span className="text-sm font-bold text-blue-300">{message}</span>
    </div>
  )
}
