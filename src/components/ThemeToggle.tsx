'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setIsAnimating(true)
    setTheme(newTheme)
    
    // Reset animation after transition
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />
    }
    return resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
  }

  const getNextTheme = () => {
    if (theme === 'light') return 'dark'
    if (theme === 'dark') return 'system'
    return 'light'
  }

  return (
    <div className="relative">
      <button
        onClick={() => handleThemeChange(getNextTheme())}
        className={`
          group relative flex items-center justify-center w-12 h-12 rounded-xl
          bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900
          border border-gray-300 dark:border-gray-700
          shadow-lg hover:shadow-xl
          transition-all duration-300 ease-out
          transform hover:scale-105 active:scale-95
          ${isAnimating ? 'animate-spin' : ''}
          before:absolute before:inset-0 before:rounded-xl
          before:bg-gradient-to-br before:from-white/20 before:to-transparent
          before:opacity-0 hover:before:opacity-100
          before:transition-opacity before:duration-300
          overflow-hidden
        `}
        style={{
          background: `
            linear-gradient(135deg, 
              hsl(var(--background)) 0%, 
              hsl(var(--muted)) 100%
            )
          `,
          boxShadow: `
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
        }}
        title={`Switch to ${getNextTheme()} mode`}
        aria-label={`Switch to ${getNextTheme()} mode`}
      >
        {/* 3D Effect Layers */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/5 to-transparent" />
        
        {/* Icon Container */}
        <div className="relative z-10 flex items-center justify-center">
          <div className={`
            transition-all duration-300 ease-out
            ${isAnimating ? 'scale-110 rotate-180' : 'scale-100 rotate-0'}
          `}>
            {getIcon()}
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Ripple Effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-purple-500/30 scale-0 group-active:scale-100 transition-transform duration-200 origin-center" />
        </div>
      </button>

      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded-md whitespace-nowrap">
          {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'} Mode
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
      </div>
    </div>
  )
}
