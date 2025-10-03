'use client'

import { useEffect, useState } from 'react'
import { useAdminPermissions } from '@/lib/hooks/useAdminPermissions'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface Approval {
  id: string
  type: string
  resourceType: string
  resourceId: string
  amount?: number
  reason?: string
  status: string
  requestedBy: { id: string; email: string; name?: string | null }
  approvedBy?: { id: string; email: string; name?: string | null } | null
  createdAt: string
}

const STATUS = ['PENDING','APPROVED','REJECTED'] as const

type StatusKey = typeof STATUS[number]

export default function AdminApprovalsClient() {
  const { has } = useAdminPermissions()
  const canManage = has('approvals.manage')

  const [active, setActive] = useState<StatusKey>('PENDING')
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [announce, setAnnounce] = useState<string>('')

  const load = async (status: StatusKey) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/approvals?status=${status}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load approvals')
      const data = await res.json()
      setApprovals(data.approvals || [])
      setAnnounce(`${data.approvals?.length || 0} ${status.toLowerCase()} approvals loaded`)
    } catch (e: any) {
      setError(e?.message || 'Error loading approvals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(active)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const onAction = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/approvals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    })
    if (!res.ok) return alert('Failed to update')
    setAnnounce(`Approval ${action}d`)
    load(active)
  }

  const onExecute = async (id: string) => {
    const res = await fetch(`/api/admin/approvals/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (!res.ok) return alert('Failed to execute')
    setAnnounce('Approved action executed')
    load(active)
  }

  const statusBadge = (s: string) => (
    <Badge variant={s === 'PENDING' ? 'secondary' : s === 'APPROVED' ? 'success' : 'destructive'}>{s}</Badge>
  )

  return (
    <div className="p-6">
      <Typography variant="h2" className="mb-4">Approvals</Typography>
      <div id="live-region" role="status" aria-live="polite" className="sr-only">{announce}</div>
      <Tabs value={active} onValueChange={(v) => setActive(v as StatusKey)} className="w-full">
        <TabsList aria-label="Approval status tabs">
          {STATUS.map(s => (
            <TabsTrigger key={s} value={s} aria-controls={`panel-${s.toLowerCase()}`}>
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
        {STATUS.map(s => (
          <TabsContent key={s} value={s} id={`panel-${s.toLowerCase()}`} className="mt-6">
            {loading ? (
              <div>Loading…</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : approvals.length === 0 ? (
              <div className="text-muted-foreground">No approvals</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label={`${s.toLowerCase()} approvals`}>
                  <caption className="sr-only">List of {s.toLowerCase()} approvals</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="text-left p-2">Type</th>
                      <th scope="col" className="text-left p-2">Resource</th>
                      <th scope="col" className="text-left p-2">Amount</th>
                      <th scope="col" className="text-left p-2">Reason</th>
                      <th scope="col" className="text-left p-2">Requested By</th>
                      <th scope="col" className="text-left p-2">Status</th>
                      <th scope="col" className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvals.map(a => (
                      <tr key={a.id} className="border-b border-border">
                        <th scope="row" className="p-2 font-medium">{a.type}</th>
                        <td className="p-2">{a.resourceType} • {a.resourceId}</td>
                        <td className="p-2">{a.amount ?? '-'}</td>
                        <td className="p-2">{a.reason ?? '-'}</td>
                        <td className="p-2">{a.requestedBy?.email}</td>
                        <td className="p-2">{statusBadge(a.status)}</td>
                        <td className="p-2 space-x-2">
                          {a.status === 'PENDING' ? (
                            <>
                              <Button size="sm" onClick={() => onAction(a.id, 'approve')} disabled={!canManage} aria-label={`Approve ${a.type} ${a.resourceId}`} title={!canManage ? 'Requires approvals.manage' : undefined}>Approve</Button>
                              <Button size="sm" variant="secondary" onClick={() => onAction(a.id, 'reject')} disabled={!canManage} aria-label={`Reject ${a.type} ${a.resourceId}`} title={!canManage ? 'Requires approvals.manage' : undefined}>Reject</Button>
                            </>
                          ) : a.status === 'APPROVED' ? (
                            <Button size="sm" onClick={() => onExecute(a.id)} disabled={!canManage} aria-label={`Execute ${a.type} ${a.resourceId}`} title={!canManage ? 'Requires approvals.manage' : undefined}>Execute</Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
