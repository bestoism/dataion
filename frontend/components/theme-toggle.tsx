"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Hindari error hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-zinc-100" />
      ) : (
        <Moon size={20} className="text-zinc-900" />
      )}
    </button>
  )
}