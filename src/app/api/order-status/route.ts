import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { StockAPI } from '@/lib/stock-api'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    console.log('Checking order status for:', orderId)

    // Get order from database
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id
      },
      include: {
        stockSite: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.taskId) {
      return NextResponse.json({ 
        error: 'Order has no task ID' 
      }, { status: 400 })
    }

    // Get API key
    const apiKey = process.env.NEHTW_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key not configured' 
      }, { status: 500 })
    }

    // Check order status with Nehtw API
    const statusResult = await StockAPI.checkOrderStatus(order.taskId, apiKey)

    if (!statusResult.success) {
      return NextResponse.json({ 
        error: statusResult.error || 'Failed to check order status' 
      }, { status: 400 })
    }

    // Update order in database if status changed
    if (statusResult.downloadUrl && statusResult.status === 'completed') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          downloadUrl: statusResult.downloadUrl,
          fileName: statusResult.fileName
        }
      })
    }

    console.log('Order status result:', statusResult)

    return NextResponse.json({
      success: true,
      status: statusResult.status,
      downloadUrl: statusResult.downloadUrl,
      fileName: statusResult.fileName
    })

  } catch (error) {
    console.error('Error checking order status:', error)
    return NextResponse.json({ 
      error: 'Failed to check order status' 
    }, { status: 500 })
  }
}
