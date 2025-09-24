'use client'

import { useEffect, useState } from 'react'
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
  const [reducedMotion, setReducedMotion] = useState<boolean>(false)

  useEffect(() => {
    // Initialize from localStorage or system preference
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null
      const initialDark = stored === 'dark' || (stored === null && getSystemPrefersDark())
      setIsDark(initialDark)
      applyThemeClass(initialDark)
      if (typeof window !== 'undefined' && 'matchMedia' in window) {
        setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      }
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
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className={
        `relative inline-flex h-9 w-16 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] ` +
        (isDark
          ? 'border-blue-500/50 bg-gradient-to-r from-blue-600 to-blue-500'
          : 'border-amber-500/50 bg-gradient-to-r from-amber-500 to-orange-500')
      }
      style={{
        transitionDuration: reducedMotion ? '0ms' : '200ms',
      }}
    >
      {/* Icons */}
      <span className="absolute left-2 text-white/90" aria-hidden="true">
        <Sun className={`h-4 w-4 ${isDark ? 'opacity-0' : 'opacity-100'}`} />
      </span>
      <span className="absolute right-2 text-white/90" aria-hidden="true">
        <Moon className={`h-4 w-4 ${isDark ? 'opacity-100' : 'opacity-0'}`} />
      </span>

      {/* Knob */}
      <span
        aria-hidden="true"
        className={
          `pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform ` +
          (isDark ? 'translate-x-1' : 'translate-x-8')
        }
        style={{ transitionDuration: reducedMotion ? '0ms' : '200ms' }}
      />
    </button>
  )
}

export default ThemeToggle


