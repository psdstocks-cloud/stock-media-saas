'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface AdminThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark'
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined)

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem('admin-theme') as Theme || 'system'
    setTheme(savedTheme)
  }, [])

  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setActualTheme(systemPrefersDark ? 'dark' : 'light')
      } else {
        setActualTheme(theme)
      }
    }

    updateActualTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        updateActualTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    root.setAttribute('data-theme', actualTheme)
    
    // Update CSS custom properties
    if (actualTheme === 'dark') {
      root.classList.add('dark')
      root.style.setProperty('--admin-bg-primary', '#0F1015')
      root.style.setProperty('--admin-bg-secondary', '#1A1B23')
      root.style.setProperty('--admin-bg-card', '#1A1B23')
      root.style.setProperty('--admin-text-primary', '#FFFFFF')
      root.style.setProperty('--admin-text-secondary', '#A1A1AA')
      root.style.setProperty('--admin-text-muted', '#71717A')
      root.style.setProperty('--admin-border', '#27272A')
      root.style.setProperty('--admin-accent', '#F97316')
      root.style.setProperty('--admin-accent-hover', '#EA580C')
    } else {
      root.classList.remove('dark')
      root.style.setProperty('--admin-bg-primary', '#FFFFFF')
      root.style.setProperty('--admin-bg-secondary', '#F8FAFC')
      root.style.setProperty('--admin-bg-card', '#FFFFFF')
      root.style.setProperty('--admin-text-primary', '#0F172A')
      root.style.setProperty('--admin-text-secondary', '#475569')
      root.style.setProperty('--admin-text-muted', '#94A3B8')
      root.style.setProperty('--admin-border', '#E2E8F0')
      root.style.setProperty('--admin-accent', '#F97316')
      root.style.setProperty('--admin-accent-hover', '#EA580C')
    }
  }, [actualTheme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('admin-theme', newTheme)
  }

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme: handleSetTheme, actualTheme }}>
      {children}
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext)
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider')
  }
  return context
}
