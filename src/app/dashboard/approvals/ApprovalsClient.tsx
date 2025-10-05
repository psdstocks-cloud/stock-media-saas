'use client'

import { useEffect, useState } from 'react'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'

interface Approval {
  id: string
  type: string
  resourceType: string
  resourceId: string
  amount?: number
  reason?: string
  status: string
  createdAt: string
}

export default function ApprovalsClient() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/approvals/mine', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch approvals')
        const data = await res.json()
        if (!cancelled) setApprovals(data.approvals || [])
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Typography variant="h1" className="text-3xl font-bold">My Approvals</Typography>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : approvals.length === 0 ? (
        <div className="text-muted-foreground">No approval requests found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">When</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Resource</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map(a => (
                <tr key={a.id} className="border-b border-border">
                  <td className="p-2">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="p-2">{a.type}</td>
                  <td className="p-2">{a.resourceType} • {a.resourceId}</td>
                  <td className="p-2">{a.amount ?? '-'}</td>
                  <td className="p-2">
                    <Badge variant={a.status === 'PENDING' ? 'secondary' : a.status === 'APPROVED' ? 'default' : 'destructive'}>{a.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
