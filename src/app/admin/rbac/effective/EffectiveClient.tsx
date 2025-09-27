'use client'

import { useState } from 'react'
import { Typography } from '@/components/ui/typography'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function EffectiveClient() {
  const [userId, setUserId] = useState('')
  const [roles, setRoles] = useState<{id:string;name:string}[]>([])
  const [perms, setPerms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true); setError(null)
      const [rRes, pRes] = await Promise.all([
        fetch(`/api/admin/rbac/users/${encodeURIComponent(userId)}/roles`),
        fetch(`/api/admin/rbac/effective-permissions/${encodeURIComponent(userId)}`),
      ])
      if (!rRes.ok || !pRes.ok) throw new Error('Failed to load')
      const rData = await rRes.json(); const pData = await pRes.json()
      setRoles(rData.roles || [])
      setPerms(pData.permissions || [])
    } catch (e: any) {
      setError(e?.message || 'Error')
    } finally { setLoading(false) }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Typography variant="h1" className="text-3xl font-bold">Effective Permissions</Typography>
      <div className="flex items-center gap-2">
        <Input placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} className="w-80" />
        <Button onClick={load} disabled={!userId.trim()}>Inspect</Button>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-500">{error}</div>}

      {roles.length > 0 && (
        <div>
          <Typography variant="h3">Roles</Typography>
          <div className="flex flex-wrap gap-2 mt-2">
            {roles.map(r => <Badge key={r.id} variant="secondary">{r.name}</Badge>)}
          </div>
        </div>
      )}

      {perms.length > 0 && (
        <div>
          <Typography variant="h3">Permissions</Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {perms.sort().map(k => (
              <div key={k} className="px-3 py-2 rounded-md border text-sm">{k}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
