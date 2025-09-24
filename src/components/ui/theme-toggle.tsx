'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return false
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

function applyThemeClass(isDark: boolean) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false)

  useEffect(() => {
    // Initialize from localStorage or system preference
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null
      const initialDark = stored === 'dark' || (stored === null && getSystemPrefersDark())
      setIsDark(initialDark)
      applyThemeClass(initialDark)
    } catch {
      // no-op
    }
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    try {
      window.localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // no-op
    }
    applyThemeClass(next)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      onClick={toggleTheme}
      className="rounded-full"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}

export default ThemeToggle


