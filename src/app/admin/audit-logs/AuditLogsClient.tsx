'use client'

import { useEffect, useState } from 'react'
import { Typography } from '@/components/ui/typography'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface LogEntry {
  id: string
  action: string
  resourceType?: string
  resourceId?: string
  oldValues?: string
  newValues?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  admin: { id: string; email: string; name?: string | null }
}

export default function AuditLogsClient() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(50)
  const [total, setTotal] = useState(0)
  const [adminId, setAdminId] = useState('')
  const [action, setAction] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (adminId) params.set('adminId', adminId)
      if (action) params.set('action', action)
      if (resourceType) params.set('resourceType', resourceType)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setLogs(data.logs || [])
      setTotal(data.pagination?.total || 0)
    } catch (e: any) {
      setError(e?.message || 'Error loading logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const exportLogs = async (format: 'csv' | 'json') => {
    const res = await fetch('/api/admin/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ format, filters: { adminId, action, resourceType, startDate, endDate } })
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = format === 'csv' ? 'audit-logs.csv' : 'audit-logs.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="p-6 space-y-6">
      <Typography variant="h2">Audit Logs</Typography>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3" role="group" aria-label="Filters">
        <Input placeholder="Admin ID" value={adminId} onChange={e => setAdminId(e.target.value)} />
        <Input placeholder="Action (e.g., UPDATE)" value={action} onChange={e => setAction(e.target.value)} />
        <Input placeholder="Resource Type (e.g., setting)" value={resourceType} onChange={e => setResourceType(e.target.value)} />
        <Input type="date" aria-label="Start date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <Input type="date" aria-label="End date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <Button onClick={() => { setPage(1); load() }}>Apply</Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => exportLogs('csv')}>Export CSV</Button>
        <Button variant="outline" onClick={() => exportLogs('json')}>Export JSON</Button>
        <Badge variant="secondary">Total: {total}</Badge>
      </div>

      <Separator />

      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : logs.length === 0 ? (
        <div className="text-muted-foreground">No logs found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Audit logs</caption>
            <thead>
              <tr>
                <th scope="col" className="text-left p-2">When</th>
                <th scope="col" className="text-left p-2">Admin</th>
                <th scope="col" className="text-left p-2">Action</th>
                <th scope="col" className="text-left p-2">Resource</th>
                <th scope="col" className="text-left p-2">Old → New</th>
                <th scope="col" className="text-left p-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b border-border align-top">
                  <th scope="row" className="p-2 font-normal">{new Date(l.createdAt).toLocaleString()}</th>
                  <td className="p-2">{l.admin?.email}</td>
                  <td className="p-2">{l.action}</td>
                  <td className="p-2">{l.resourceType} {l.resourceId ? `• ${l.resourceId}` : ''}</td>
                  <td className="p-2">
                    <div className="text-muted-foreground">{l.oldValues || '—'}</div>
                    <div>{l.newValues || '—'}</div>
                  </td>
                  <td className="p-2">{l.ipAddress || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2" role="navigation" aria-label="Pagination">
        <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page">Prev</Button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} aria-label="Next page">Next</Button>
      </div>
    </div>
  )
}
