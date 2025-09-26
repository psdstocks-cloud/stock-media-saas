import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { requirePermission } from '@/lib/rbac'
import { PointsManager } from '@/lib/points'
import { isDualControlEnabled, requestApproval } from '@/lib/dualControl'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'points.adjust')
    if (guard) return guard

    const { userId, amount, reason } = await request.json()
    if (!userId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 })
    }

    if (await isDualControlEnabled()) {
      const approval = await requestApproval({
        type: 'POINTS_ADJUST',
        resourceType: 'user',
        resourceId: userId,
        amount,
        reason,
        requestedById: session!.user!.id,
      })
      return NextResponse.json({ approval, pending: true }, { status: 202 })
    } else {
      const balance = await PointsManager.addPoints(userId, amount, 'ADMIN_ADJUSTMENT', reason)
      return NextResponse.json({ success: true, balance })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to adjust points' }, { status: 500 })
  }
}
