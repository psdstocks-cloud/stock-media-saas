'use client'

import { useEffect, useState } from 'react'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Role { id: string; name: string; description?: string | null }

export default function RolesClient() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Role | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [permissions, setPermissions] = useState<string[]>([])
  const [_members, setMembers] = useState<{id:string;email:string}[]>([])
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignIds, setAssignIds] = useState<string>('')
  const [allPermissions, setAllPermissions] = useState<string[]>([])
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importDryRun, setImportDryRun] = useState<any>(null)

  async function load() {
    try {
      setLoading(true)
      const listRes = await fetch(`/api/admin/rbac/roles?search=${encodeURIComponent(search)}`)
      if (!listRes.ok) throw new Error('Failed to fetch roles')
      const listData = await listRes.json()
      setRoles(listData.roles || [])
      const permRes = await fetch('/api/admin/rbac/permissions')
      if (permRes.ok) {
        const pd = await permRes.json()
        setAllPermissions(pd.permissions || [])
      }
    } catch (e: any) {
      setError(e?.message || 'Error loading roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onSelectRole = async (role: Role) => {
    setSelected(role)
    try {
      const res = await fetch(`/api/admin/rbac/roles/${role.id}/permissions`)
      if (res.ok) {
        const data = await res.json()
        setPermissions(data.permissions || [])
      }
      // load members via user roles (server supports by user → roles, so we skip for now or leave placeholder)
      setMembers([])
    } catch {
      /* no-op */
    }
  }

  const togglePerm = (key: string) => {
    setPermissions(prev => prev.includes(key) ? prev.filter(k => k !== key) : prev.concat(key))
  }

  const savePerms = async () => {
    if (!selected) return
    const res = await fetch(`/api/admin/rbac/roles/${selected.id}/permissions`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ permissions })
    })
    if (!res.ok) alert('Failed to save permissions')
  }

  const createRole = async () => {
    const res = await fetch('/api/admin/rbac/roles', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, description: newDesc })
    })
    if (res.ok) { setNewName(''); setNewDesc(''); setCreateOpen(false); load() } else { alert('Failed to create role') }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-3xl font-bold">Roles & Permissions</Typography>
          <Typography variant="body" color="muted" className="mt-2">Create roles, toggle permissions, and assign to users</Typography>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search roles..." value={search} onChange={e => setSearch(e.target.value)} className="w-60" />
          <Button onClick={load}>Search</Button>
          <Button onClick={() => setCreateOpen(true)}>New Role</Button>
          <Button variant="outline" onClick={() => window.open('/api/admin/rbac/export?includeUsers=1', '_blank')}>Export JSON</Button>
          <Button variant="secondary" onClick={() => setImportOpen(true)}>Import</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles list */}
        <Card className="p-4 lg:col-span-1">
          {loading ? (
            <div>Loading…</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : roles.length === 0 ? (
            <div className="text-muted-foreground">No roles found</div>
          ) : (
            <div className="space-y-2">
              {roles.map(r => (
                <button key={r.id} onClick={() => onSelectRole(r)} className={`w-full text-left px-3 py-2 rounded-md hover:bg-[hsl(var(--muted))] ${selected?.id===r.id ? 'ring-1 ring-[hsl(var(--ring))]' : ''}`}>
                  <div className="font-medium">{r.name}</div>
                  {r.description && <div className="text-xs text-muted-foreground">{r.description}</div>}
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Role detail */}
        <Card className="p-4 lg:col-span-2">
          {!selected ? (
            <div className="text-muted-foreground">Select a role to edit permissions</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{selected.name}</div>
                  {selected.description && <div className="text-sm text-muted-foreground">{selected.description}</div>}
                </div>
                <Badge variant="secondary">{permissions.length} perms</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[420px] overflow-auto pr-1">
                {allPermissions.map(key => (
                  <label key={key} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[hsl(var(--muted))]">
                    <input type="checkbox" checked={permissions.includes(key)} onChange={() => togglePerm(key)} />
                    <span className="text-sm">{key}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={savePerms}>Save Permissions</Button>
                <Button variant="outline" onClick={() => setAssignOpen(true)}>Assign Users</Button>
                <a href={`/admin/rbac/effective?role=${encodeURIComponent(selected.name)}`} className="text-sm underline">View effective access</a>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Create role modal (simple inline) */}
      {createOpen && (
        <Card className="p-4 space-y-3">
          <div className="text-lg font-semibold">Create Role</div>
          <Input placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} />
          <Input placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          <div className="flex items-center gap-2">
            <Button onClick={createRole} disabled={!newName.trim()}>Create</Button>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Assign Users inline drawer (simple) */}
      {assignOpen && selected && (
        <Card className="p-4 space-y-3">
          <div className="text-lg font-semibold">Assign users to {selected.name}</div>
          <div className="text-sm text-muted-foreground">Enter comma-separated user IDs to assign or remove.</div>
          <Input placeholder="userId1,userId2" value={assignIds} onChange={e => setAssignIds(e.target.value)} />
          <div className="flex items-center gap-2">
            <Button onClick={async ()=>{
              const ids = assignIds.split(',').map(s=>s.trim()).filter(Boolean)
              if (ids.length===0) return
              const res = await fetch(`/api/admin/rbac/roles/${selected.id}/assign`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userIds: ids }) })
              if (!res.ok) alert('Failed to assign')
            }}>Assign</Button>
            <Button variant="secondary" onClick={async ()=>{
              const ids = assignIds.split(',').map(s=>s.trim()).filter(Boolean)
              if (ids.length===0) return
              const res = await fetch(`/api/admin/rbac/roles/${selected.id}/unassign`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userIds: ids }) })
              if (!res.ok) alert('Failed to unassign')
            }}>Unassign</Button>
            <Button variant="ghost" onClick={()=> setAssignOpen(false)}>Close</Button>
          </div>
        </Card>
      )}

      {/* Import panel */}
      {importOpen && (
        <Card className="p-4 space-y-3">
          <div className="text-lg font-semibold">Import Roles (JSON)</div>
          <textarea className="w-full h-48 p-2 rounded-md border" value={importText} onChange={e => setImportText(e.target.value)} placeholder='{"roles":[{"name":"Ops","permissions":["orders.view"],"users":["userId"]}]}' />
          <div className="flex items-center gap-2">
            <Button onClick={async ()=>{
              try {
                const roles = JSON.parse(importText).roles
                const res = await fetch('/api/admin/rbac/import', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ roles, dryRun:true }) })
                const data = await res.json(); setImportDryRun(data)
              } catch { alert('Invalid JSON') }
            }}>Dry‑run</Button>
            <Button variant="secondary" onClick={async ()=>{
              try {
                const roles = JSON.parse(importText).roles
                const res = await fetch('/api/admin/rbac/import', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ roles, dryRun:false }) })
                if (!res.ok) alert('Import failed'); else { setImportOpen(false); setImportDryRun(null); setImportText(''); load() }
              } catch { alert('Invalid JSON') }
            }}>Apply</Button>
            <Button variant="ghost" onClick={()=> { setImportOpen(false); setImportDryRun(null) }}>Close</Button>
          </div>
          {importDryRun && (
            <div className="mt-2 text-sm">
              <div className="font-medium">Dry‑run summary</div>
              <ul className="list-disc pl-5">
                {(importDryRun.diffs || []).map((d:any, i:number)=> (
                  <li key={i}>{d.role}: {d.create ? 'create' : 'update'}; add {d.addPerms.length}, remove {d.removePerms.length}{typeof d.setUsers==='number' ? `; set ${d.setUsers} users` : ''}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
