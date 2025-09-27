'use client'

import { useEffect, useState } from 'react'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Typography } from '@/components/ui/typography'

interface SettingItem {
  key: string
  value: string
  type?: string
}

export default function AdminSettingsClient() {
  const { has } = usePermissions()
  const canWrite = has('settings.write')
  const [settings, setSettings] = useState<SettingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/settings', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load settings')
        const data = await res.json()
        if (!cancelled) setSettings((data.settings || []).map((s: any) => ({ key: s.key, value: s.value, type: s.type })))
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const onChange = (idx: number, value: string) => {
    setSettings(prev => prev.map((s, i) => i === idx ? { ...s, value } : s))
  }

  const onSave = async (item: SettingItem) => {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: item.key, value: item.value }),
    })
    if (!res.ok) {
      alert('Failed to save setting')
    }
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6 space-y-6">
      <Typography variant="h2">Admin Settings</Typography>
      <div className="grid gap-4">
        {settings.map((item, idx) => (
          <div key={item.key} className="flex items-center gap-3">
            <label className="min-w-48 text-sm text-muted-foreground" htmlFor={`setting-${idx}`}>{item.key}</label>
            {item.type === 'boolean' ? (
              <div className="flex items-center gap-2">
                <Switch
                  id={`setting-${idx}`}
                  checked={(item.value ?? '').toString() === 'true'}
                  onCheckedChange={(checked) => onChange(idx, checked ? 'true' : 'false')}
                  disabled={!canWrite}
                  aria-label={`${item.key} toggle`}
                />
                <span className="text-sm text-muted-foreground">{(item.value ?? '').toString() === 'true' ? 'On' : 'Off'}</span>
              </div>
            ) : (
              <Input
                id={`setting-${idx}`}
                value={item.value ?? ''}
                onChange={e => onChange(idx, e.target.value)}
                disabled={!canWrite}
              />
            )}
            <Button onClick={() => onSave(item)} disabled={!canWrite} aria-label={`Save ${item.key}`}>Save</Button>
          </div>
        ))}
      </div>
      {!canWrite && (
        <div className="text-sm text-muted-foreground">You have read-only access. Ask an admin for settings.write.</div>
      )}
    </div>
  )
}
