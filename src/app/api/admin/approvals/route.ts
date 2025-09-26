import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { requestApproval } from '@/lib/dualControl'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'approvals.manage')
    if (guard) return guard

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'

    const approvals = await prisma.approvalRequest.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: { select: { id: true, email: true, name: true } },
        approvedBy: { select: { id: true, email: true, name: true } },
      }
    })

    return NextResponse.json({ approvals })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { type, resourceType, resourceId, amount, reason } = body
    if (!type || !resourceType || !resourceId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const approval = await requestApproval({
      type,
      resourceType,
      resourceId,
      amount,
      reason,
      requestedById: session.user.id,
    })

    return NextResponse.json({ approval }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create approval' }, { status: 500 })
  }
}
