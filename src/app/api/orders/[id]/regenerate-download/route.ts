import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderManager } from '@/lib/nehtw-api'
import { getUserFromRequest } from '@/lib/jwt-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate via JWT in headers/cookies
    const jwtUser = getUserFromRequest(request)
    if (!jwtUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: orderId } = await params

    // Get the order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: jwtUser.id
      },
      include: {
        stockSite: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Require taskId to regenerate
    if (!order.taskId) {
      // If we have an existing downloadUrl, use it as fallback
      if (order.downloadUrl) {
        return NextResponse.json({ 
          success: true, 
          downloadUrl: order.downloadUrl,
          warning: 'Using existing download link - order has no task ID'
        })
      }
      return NextResponse.json({ 
        error: 'Order not ready for download - no task ID', 
        status: order.status 
      }, { status: 400 })
    }

    // Generate fresh download link using OrderManager (FREE redownload)
    const rawApiKey = process.env.NEHTW_API_KEY
    if (!rawApiKey || rawApiKey === 'your-nehtw-api-key-here') {
      if (order.downloadUrl) {
        return NextResponse.json({ 
          success: true, 
          downloadUrl: order.downloadUrl,
          warning: 'Using existing download link - API key not configured'
        })
      }
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const apiKey = rawApiKey.replace(/[{}]/g, '')
    const updatedOrder = await OrderManager.regenerateDownloadLink(orderId, apiKey)

    if (updatedOrder && updatedOrder.downloadUrl) {
      return NextResponse.json({ success: true, downloadUrl: updatedOrder.downloadUrl })
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to regenerate download link' 
    }, { status: 500 })
  }
}
