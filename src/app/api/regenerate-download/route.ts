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

    console.log('Regenerating download link for order:', orderId)

    // Get order from database
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id
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

    // Regenerate download link
    const result = await StockAPI.regenerateDownloadLink(order.taskId, apiKey)

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to regenerate download link' 
      }, { status: 400 })
    }

    // Update order with new download link
    await prisma.order.update({
      where: { id: orderId },
      data: {
        downloadUrl: result.downloadUrl,
        fileName: result.fileName,
        status: 'COMPLETED'
      }
    })

    console.log('Download link regenerated successfully:', result)

    return NextResponse.json({
      success: true,
      downloadUrl: result.downloadUrl,
      fileName: result.fileName
    })

  } catch (error) {
    console.error('Error regenerating download link:', error)
    return NextResponse.json({ 
      error: 'Failed to regenerate download link' 
    }, { status: 500 })
  }
}
