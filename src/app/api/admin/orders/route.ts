import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get admin token from cookies
    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT token
    const user = verifyJWT(adminToken);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT token
    const user = verifyJWT(adminToken);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
