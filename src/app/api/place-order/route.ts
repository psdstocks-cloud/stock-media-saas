import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NehtwAPI, OrderManager } from '@/lib/nehtw-api'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url, site, id, title, cost, imageUrl } = await request.json()

    if (!url || !site || !id || !cost) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { pointsBalance: true }
    })

    if (!user || !user.pointsBalance) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.pointsBalance.currentPoints < cost) {
      return NextResponse.json({ 
        error: 'Insufficient points', 
        currentPoints: user.pointsBalance.currentPoints,
        requiredPoints: cost
      }, { status: 400 })
    }

    // Find stock site
    const stockSite = await prisma.stockSite.findFirst({
      where: { name: site }
    })

    if (!stockSite) {
      return NextResponse.json({ error: 'Stock site not found' }, { status: 404 })
    }

    // Create order in database
    const order = await OrderManager.createOrder(
      session.user.id,
      stockSite.id,
      id,
      url,
      title || 'Untitled',
      cost
    )

    // Deduct points
    await prisma.pointsBalance.update({
      where: { userId: session.user.id },
      data: {
        currentPoints: {
          decrement: cost
        }
      }
    })

    // Add points history
    await prisma.pointsHistory.create({
      data: {
        userId: session.user.id,
        amount: -cost,
        type: 'DOWNLOAD',
        description: `Download: ${title || 'Untitled'} from ${site}`,
        orderId: order.id
      }
    })

    // Process order with nehtw.com API
    const apiKey = process.env.NEHTW_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    try {
      await OrderManager.processOrder(order.id, apiKey, site, id, url)
    } catch (error) {
      console.error('Order processing error:', error)
      // Order was created but processing failed - this is handled by the order status
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        title: order.title,
        cost: order.cost,
        createdAt: order.createdAt
      }
    })
  } catch (error) {
    console.error('Place order error:', error)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
