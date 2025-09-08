import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PointsManager } from '@/lib/points'
import { OrderManager } from '@/lib/nehtw-api'

export async function POST(request: NextRequest) {
  try {
    const { userId, stockSiteId, stockItemId, stockItemUrl, title } = await request.json()

    // Get stock site info
    const stockSite = await prisma.stockSite.findUnique({
      where: { id: stockSiteId },
    })

    if (!stockSite) {
      return NextResponse.json({ error: 'Stock site not found' }, { status: 404 })
    }

    // Check if user has enough points
    const balance = await prisma.pointsBalance.findUnique({
      where: { userId },
    })

    if (!balance || balance.currentPoints < stockSite.cost) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }

    // Create order
    const order = await OrderManager.createOrder(
      userId,
      stockSiteId,
      stockItemId,
      stockItemUrl,
      title,
      stockSite.cost
    )

    // Deduct points
    await PointsManager.deductPoints(
      userId,
      stockSite.cost,
      `Order for ${stockSite.displayName} #${stockItemId}`,
      order.id
    )

    // Process order with nehtw.com API (this would need the user's API key)
    // For now, we'll just mark it as processing
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PROCESSING' },
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
        ...(status && { status: status as any }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        stockSite: true,
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
