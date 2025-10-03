import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt-auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-log'
import { requirePermission } from '@/lib/rbac'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const guard = await requirePermission(request, user.id, 'orders.view')
    if (guard) return guard

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (userId) where.userId = userId

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          stockSite: true,
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const guard = await requirePermission(request, user.id, 'orders.manage')
    if (guard) return guard

    const { orderId, status, notes } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status required' }, { status: 400 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        stockSite: true,
      },
    })

    // Audit log
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    await createAuditLog({
      adminId: user.id,
      action: 'UPDATE',
      resourceType: 'order',
      resourceId: orderId,
      newValues: { status, notes },
      permission: 'orders.manage',
      reason: 'Admin updated order status',
      permissionSnapshot: { permissions: ['orders.manage'] },
      ipAddress: clientIP,
      userAgent,
    })

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
