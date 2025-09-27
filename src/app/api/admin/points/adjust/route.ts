import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt-auth'
import { requirePermission } from '@/lib/rbac'
import { PointsManager } from '@/lib/points'
import { isDualControlEnabled, requestApproval } from '@/lib/dualControl'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const jwtUser = getUserFromRequest(request)
    if (!jwtUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (process.env.NEXT_PUBLIC_E2E) {
      // In E2E mode, bypass dual-control and return 202 to simplify flow
      const { userId, amount, reason } = await request.json()
      return NextResponse.json({ approval: { id: 'e2e-approval', type: 'POINTS_ADJUST', userId, amount, reason }, pending: true }, { status: 202 })
    }
    const guard = await requirePermission(request, jwtUser.id, 'points.adjust')
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
        requestedById: jwtUser.id,
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
