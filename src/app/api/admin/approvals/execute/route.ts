import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt-auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { PointsManager } from '@/lib/points'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Get admin token from cookies
    const adminToken = request.cookies.get('auth-token')?.value;
    if (!adminToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required. Please log in again.' 
      }, { status: 401 });
    }

    // Verify JWT token
    const user = verifyJWT(adminToken);
    if (!user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid authentication token.' 
      }, { status: 401 })
    }
    
    const guard = await requirePermission(request, user.id, 'approvals.manage')
    if (guard) return guard

    const { id } = await request.json()
    if (!id) return NextResponse.json({ 
      success: false,
      error: 'Missing approval id' 
    }, { status: 400 })

    const approval = await prisma.approvalRequest.findUnique({ where: { id } })
    if (!approval) return NextResponse.json({ 
      success: false,
      error: 'Approval not found' 
    }, { status: 404 })
    if (approval.status !== 'APPROVED') return NextResponse.json({ 
      success: false,
      error: 'Approval is not APPROVED' 
    }, { status: 400 })

    if (approval.type === 'POINTS_ADJUST' && approval.resourceType === 'user' && approval.amount) {
      await PointsManager.addPoints(
        approval.resourceId,
        approval.amount,
        'ADMIN_ADJUSTMENT',
        approval.reason || undefined
      )
    } else if (approval.type === 'ORDER_REFUND' && approval.resourceType === 'order' && approval.amount) {
      const order = await prisma.order.findUnique({ where: { id: approval.resourceId } })
      if (!order) return NextResponse.json({ 
        success: false,
        error: 'Order not found' 
      }, { status: 404 })
      await PointsManager.refundPoints(order.userId, approval.resourceId, approval.amount, approval.reason || 'Admin refund')
      await prisma.order.update({ where: { id: approval.resourceId }, data: { status: 'REFUNDED' } })
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'Unsupported approval action' 
      }, { status: 400 })
    }

    await prisma.approvalRequest.update({ where: { id }, data: { status: 'CANCELED' } })
    return NextResponse.json({ 
      success: true,
      message: 'Approval executed successfully' 
    })
  } catch (e) {
    return NextResponse.json({ 
      success: false,
      error: 'Failed to execute approval' 
    }, { status: 500 })
  }
}
