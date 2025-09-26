'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'

export default function NotificationsMenu() {
  const items = useAppStore((s) => s.notifications)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="focus-visible:ring-2 focus-visible:ring-primary/60">
          <Bell className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
          <div className="text-sm font-semibold">Notifications</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">Recent activity and alerts</div>
        </div>
        <div className="max-h-80 overflow-auto bg-[hsl(var(--card))]" aria-live="polite">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-xs text-[hsl(var(--muted-foreground))]">No notifications</div>
          ) : (
            items.map((n) => (
              <a key={n.id} href={n.href || '#'} className="flex items-start gap-3 px-4 py-3 hover:bg-[hsl(var(--muted))] transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[hsl(var(--card-foreground))] truncate">{n.title}</div>
                  {n.body && <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">{n.body}</div>}
                </div>
                {n.cta && <div className="text-xs font-medium text-primary whitespace-nowrap">{n.cta}</div>}
              </a>
            ))
          )}
        </div>
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-right">
          <a href="/dashboard/history" className="text-xs text-primary hover:underline">View all</a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


