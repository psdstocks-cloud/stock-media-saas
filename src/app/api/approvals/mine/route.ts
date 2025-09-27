import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt-auth'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Identify user
    let userId: string | undefined
    const jwtUser = getUserFromRequest(request)
    if (jwtUser?.id) userId = jwtUser.id
    if (!userId) {
      const session = await auth()
      if (session?.user?.id) userId = session.user.id
    }
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Approvals on user resource
    const userApprovals = await prisma.approvalRequest.findMany({
      where: { resourceType: 'user', resourceId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Approvals on order resource for this user's orders
    const orderApprovals = await prisma.approvalRequest.findMany({
      where: { resourceType: 'order' },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    const orderIds = orderApprovals.map(a => a.resourceId)
    const orders = await prisma.order.findMany({ where: { id: { in: orderIds }, userId } })
    const allowedOrderIds = new Set(orders.map(o => o.id))
    const myOrderApprovals = orderApprovals.filter(a => allowedOrderIds.has(a.resourceId))

    const approvals = [...userApprovals, ...myOrderApprovals]
    return NextResponse.json({ approvals })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load approvals' }, { status: 500 })
  }
}
