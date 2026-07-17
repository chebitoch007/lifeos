"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Activity, BarChart2, LogOut, Menu, Trophy, X } from "lucide-react"
import { signOut } from "next-auth/react"

interface DashboardHeaderProps {
  showNavLinks?: boolean
}

const NAV_LINKS = [
  { href: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/dashboard/achievements", icon: Trophy, label: "Achievements" },
  { href: "/dashboard/habits", icon: Activity, label: "Habits" },
] as const

export default function DashboardHeader({ showNavLinks = true }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800/60 bg-[#0a0a0f]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-1">
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
            <span className="mr-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              LifeOS
            </span>
          </Link>

          {/* Desktop nav — hidden on mobile */}
          {showNavLinks && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
                >
                  <Icon size={13} />
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right: hamburger (mobile) + sign out (always) */}
        <div className="flex items-center gap-2">
          {/* Hamburger — mobile only */}
          {showNavLinks && (
            <div className="relative md:hidden" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center justify-center rounded-lg border border-slate-700 p-1.5 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-slate-700/60 bg-[#0d0d1a] shadow-xl">
                  {NAV_LINKS.map(({ href, icon: Icon, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
                    >
                      <Icon size={15} />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sign out — always visible */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
