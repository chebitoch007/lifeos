"use client"

import { useState, useCallback } from "react"
import Toast from "@/components/ui/Toast"

interface XPToastState {
  message: string
  key: number
}

export function useXPToast() {
  const [toast, setToast] = useState<XPToastState | null>(null)

  const showXP = useCallback((xpAmount: number) => {
    setToast({ message: `+${xpAmount} XP`, key: Date.now() })
  }, [])

  const dismiss = useCallback(() => setToast(null), [])

  return { toast, showXP, dismiss }
}

interface XPToastProps {
  toast: XPToastState | null
  onDone: () => void
}

export default function XPToast({ toast, onDone }: XPToastProps) {
  if (!toast) return null
  return <Toast key={toast.key} message={toast.message} onDone={onDone} />
}
