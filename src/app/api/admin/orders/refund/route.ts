import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { requirePermission } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { PointsManager } from '@/lib/points'
import { isDualControlEnabled, requestApproval } from '@/lib/dualControl'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'orders.refund')
    if (guard) return guard

    const { orderId, amount, reason } = await request.json()
    if (!orderId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Missing orderId or amount' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    if (await isDualControlEnabled()) {
      const approval = await requestApproval({
        type: 'ORDER_REFUND',
        resourceType: 'order',
        resourceId: orderId,
        amount,
        reason,
        requestedById: session!.user!.id,
      })
      return NextResponse.json({ approval, pending: true }, { status: 202 })
    } else {
      await PointsManager.refundPoints(order.userId, orderId, amount, reason || 'Admin refund')
      await prisma.order.update({ where: { id: orderId }, data: { status: 'REFUNDED' } })
      return NextResponse.json({ success: true })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to refund order' }, { status: 500 })
  }
}
