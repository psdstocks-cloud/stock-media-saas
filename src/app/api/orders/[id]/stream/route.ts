import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth-user"
import { OrderProcessor } from '@/lib/order-processor'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const clientIdentifier = getClientIdentifier(request)
    const rateLimitResult = await checkRateLimit(clientIdentifier, 'general')
    
    if (!rateLimitResult.success) {
      return NextResponse.json({ 
        error: 'Too many requests. Please wait before checking again.',
        remaining: rateLimitResult.remaining,
        resetTime: new Date(rateLimitResult.reset).toISOString()
      }, { status: 429 })
    }
    
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: orderId } = params

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        
        // Send initial status
        const sendUpdate = (update: any) => {
          const data = `data: ${JSON.stringify(update)}\n\n`
          controller.enqueue(encoder.encode(data))
        }
        
        // Subscribe to order status updates
        OrderProcessor.subscribeToOrderStatus(orderId, (update) => {
          sendUpdate(update)
          
          // Close stream when order is completed or failed
          if (update.status === 'COMPLETED' || update.status === 'FAILED') {
            controller.close()
            OrderProcessor.unsubscribeFromOrderStatus(orderId)
          }
        })
        
        // Send initial status
        sendUpdate({
          orderId,
          status: order.status,
          message: 'Connected to order status stream'
        })
        
        // Set up cleanup on client disconnect
        request.signal.addEventListener('abort', () => {
          OrderProcessor.unsubscribeFromOrderStatus(orderId)
          controller.close()
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })
  } catch (error) {
    console.error('Order stream error:', error)
    return NextResponse.json({ error: 'Failed to create order stream' }, { status: 500 })
  }
}
