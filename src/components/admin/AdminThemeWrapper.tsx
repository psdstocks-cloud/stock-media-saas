'use client'

import { AdminThemeProvider } from '@/contexts/AdminThemeContext'
import { useAdminTheme } from '@/contexts/AdminThemeContext'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function ThemeToggle() {
  const { theme, setTheme } = useAdminTheme()

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center space-x-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center space-x-2">
            <Monitor className="h-4 w-4" />
            <span>System</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export function AdminThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <div className="min-h-screen" style={{
        backgroundColor: 'var(--admin-bg-primary)',
        color: 'var(--admin-text-primary)'
      }}>
        {children}
      </div>
    </AdminThemeProvider>
  )
}

export { ThemeToggle }
