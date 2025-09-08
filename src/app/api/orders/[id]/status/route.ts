import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { OrderManager } from '@/lib/nehtw-api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      include: {
        stockSite: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order status:', error)
    return NextResponse.json({ error: 'Failed to fetch order status' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 })
    }

    // Check if user has this API key
    const userApiKey = await prisma.apiKey.findFirst({
      where: { 
        userId: session.user.id,
        key: apiKey,
        isActive: true
      },
    })

    if (!userApiKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const order = await prisma.order.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      include: {
        stockSite: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.taskId) {
      return NextResponse.json({ error: 'Order not yet processed' }, { status: 400 })
    }

    // Check order status with nehtw.com API
    const updatedOrder = await OrderManager.checkOrderStatus(params.id, apiKey)

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error('Error checking order status:', error)
    return NextResponse.json({ error: 'Failed to check order status' }, { status: 500 })
  }
}
