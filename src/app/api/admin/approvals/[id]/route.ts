import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { approveRequest, rejectRequest } from '@/lib/dualControl'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'approvals.manage')
    if (guard) return guard

    const { id } = await params
    const { action, reason } = await request.json()

    if (action === 'approve') {
      const approval = await approveRequest({ id, approvedById: session!.user!.id })
      return NextResponse.json({ approval })
    } else if (action === 'reject') {
      const approval = await rejectRequest({ id, approvedById: session!.user!.id, reason })
      return NextResponse.json({ approval })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 })
  }
}
