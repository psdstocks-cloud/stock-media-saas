'use client'

import { Bell, CheckCircle, Download, CircleAlert, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'

export default function NotificationsMenu() {
  // Demo list
  const items = [
    {
      id: 'n1',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      title: 'Order completed',
      body: 'Shutterstock • ID 420756877',
      cta: 'Download',
      href: '/dashboard/history',
    },
    {
      id: 'n2',
      icon: <Clock className="h-4 w-4 text-blue-500" />,
      title: 'Processing started',
      body: 'Adobe Stock • ID 454407674',
      cta: 'View status',
      href: '/dashboard/history',
    },
    {
      id: 'n3',
      icon: <CircleAlert className="h-4 w-4 text-orange-500" />,
      title: 'Low points',
      body: 'You have 20 points left',
      cta: 'Buy points',
      href: '/pricing',
    },
  ]

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
        <div className="max-h-80 overflow-auto bg-[hsl(var(--card))]">
          {items.map((n) => (
            <a key={n.id} href={n.href} className="flex items-start gap-3 px-4 py-3 hover:bg-[hsl(var(--muted))] transition-colors">
              <div className="mt-0.5">{n.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-[hsl(var(--card-foreground))] truncate">{n.title}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">{n.body}</div>
              </div>
              <div className="text-xs font-medium text-primary whitespace-nowrap">{n.cta}</div>
            </a>
          ))}
        </div>
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-right">
          <a href="/dashboard/history" className="text-xs text-primary hover:underline">View all</a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


