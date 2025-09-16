import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { PointsManager } from '@/lib/points'
import { OrderManager } from '@/lib/nehtw-api'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { stockSiteId, stockItemId, stockItemUrl, title } = await request.json()
    const userId = session.user.id

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
    // Get user session
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Add rate limiting headers
    const response = new NextResponse()
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
    response.headers.set('X-RateLimit-Limit', '10')
    response.headers.set('X-RateLimit-Remaining', '9')

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = session.user.id

    console.log('Fetching orders for userId:', userId, 'status:', status)

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

    console.log('Found orders:', orders.length, 'orders for user:', userId)
    console.log('Orders data:', orders.map(o => ({ id: o.id, status: o.status, taskId: o.taskId })))

    const data = { 
      success: true, 
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        title: order.title,
        cost: order.cost,
        createdAt: order.createdAt,
        downloadUrl: order.downloadUrl,
        fileName: order.fileName,
        imageUrl: order.imageUrl,
        stockSite: order.stockSite
      }))
    }

    return NextResponse.json(data, { 
      status: 200,
      headers: response.headers
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
