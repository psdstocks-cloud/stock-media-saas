'use client'

import { useEffect, useState } from 'react'
import { useAdminPermissions } from '@/lib/hooks/useAdminPermissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Typography } from '@/components/ui/typography'

interface Flag {
  id: string
  name: string
  description?: string
  isEnabled: boolean
  rolloutPercentage: number
}

export default function FeatureFlagsClient() {
  const { has } = useAdminPermissions()
  const canView = has('flags.view')
  const canManage = has('flags.manage')

  const [flags, setFlags] = useState<Flag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/feature-flags', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load flags')
        const data = await res.json()
        if (!cancelled) setFlags(data.featureFlags || [])
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (canView) load()
    return () => { cancelled = true }
  }, [canView])

  const toggle = async (flag: Flag, enabled: boolean) => {
    const res = await fetch(`/api/admin/feature-flags/${flag.id}` , {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isEnabled: enabled })
    })
    if (res.ok) {
      setFlags(prev => prev.map(f => f.id === flag.id ? { ...f, isEnabled: enabled } : f))
    } else {
      alert('Failed to update flag')
    }
  }

  if (!canView) return <div className="p-6 text-muted-foreground">You do not have permission to view feature flags.</div>
  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6 space-y-6">
      <Typography variant="h2">Feature Flags</Typography>
      <div className="grid gap-4">
        {flags.map(flag => (
          <div key={flag.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div>
              <div className="font-medium">{flag.name}</div>
              {flag.description && (
                <div className="text-sm text-muted-foreground">{flag.description}</div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={flag.isEnabled} onCheckedChange={(v) => toggle(flag, v)} disabled={!canManage} title={!canManage ? 'Requires flags.manage' : undefined} />
              <span className="text-sm text-muted-foreground">{flag.isEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Rollout %</label>
              <Input type="number" defaultValue={flag.rolloutPercentage} min={0} max={100} disabled={!canManage} />
              <Button disabled={!canManage} onClick={() => alert('Adjusting rollout requires backend call')} title={!canManage ? 'Requires flags.manage' : undefined}>Update</Button>
            </div>
          </div>
        ))}
      </div>
      {!canManage && (
        <div className="text-sm text-muted-foreground">You have view-only access. Ask for flags.manage to make changes.</div>
      )}
    </div>
  )
}
