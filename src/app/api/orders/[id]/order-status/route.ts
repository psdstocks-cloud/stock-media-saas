import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    console.log('Order status API called for order:', orderId)
    
    // Rate limiting
    const clientIdentifier = getClientIdentifier(request)
    const rateLimitResult = await checkRateLimit(clientIdentifier, 'general')
    
    if (!rateLimitResult.success) {
      console.log('Rate limit exceeded for order status check:', clientIdentifier)
      return NextResponse.json({ 
        error: 'Too many requests. Please wait before checking again.',
        remaining: rateLimitResult.remaining,
        resetTime: new Date(rateLimitResult.reset).toISOString()
      }, { status: 429 })
    }
    
    const session = await auth()
    
    if (!session?.user?.id) {
      console.log('Unauthorized access to order status')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('Looking for order:', orderId, 'for user:', session.user.id)

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id
      },
      include: {
        stockSite: true
      }
    })

    console.log('Order found:', { 
      found: !!order, 
      id: order?.id, 
      status: order?.status, 
      downloadUrl: !!order?.downloadUrl 
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        title: order.title,
        cost: order.cost,
        createdAt: order.createdAt,
        downloadUrl: order.downloadUrl,
        stockSite: order.stockSite
      }
    })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json({ error: 'Failed to get order' }, { status: 500 })
  }
}
