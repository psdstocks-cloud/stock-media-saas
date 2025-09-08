import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderManager } from '@/lib/nehtw-api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
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
    const session = await getServerSession(authOptions)
    
    console.log('Order status check - session:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      orderId: params.id 
    })
    
    if (!session?.user?.id) {
      console.log('Order status check - unauthorized, no session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use server-side API key instead of requiring it from client
    const apiKey = process.env.NEHTW_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'NEHTW_API_KEY not configured' }, { status: 500 })
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

    console.log('Checking order status for order:', params.id, 'with taskId:', order.taskId)

    // Check order status with nehtw.com API
    const updatedOrder = await OrderManager.checkOrderStatus(params.id, apiKey)

    console.log('Order status check result:', updatedOrder)

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder 
    })
  } catch (error) {
    console.error('Error checking order status:', error)
    return NextResponse.json({ error: 'Failed to check order status' }, { status: 500 })
  }
}
