import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt-auth'
import { auth } from '@/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Try JWT authentication first (for dashboard)
    const jwtUser = getUserFromRequest(request)
    let userId = jwtUser?.id

    // Fallback to NextAuth session if no JWT user
    if (!userId) {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = session.user.id
    }

    // Fetch the order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ 
        error: 'Order not found' 
      }, { status: 404 })
    }

    // Determine if order is still processing
    const isProcessing = order.status === 'PENDING' || order.status === 'PROCESSING'
    const canDownload = order.status === 'COMPLETED' && order.downloadUrl

    // Calculate estimated completion time (mock logic)
    let estimatedTime = null
    if (isProcessing) {
      const createdAt = new Date(order.createdAt)
      const now = new Date()
      const elapsedMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60))
      
      // Mock: orders typically take 2-5 minutes
      const estimatedTotalMinutes = 3
      const remainingMinutes = Math.max(0, estimatedTotalMinutes - elapsedMinutes)
      
      if (remainingMinutes > 0) {
        estimatedTime = `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        title: order.title,
        source: order.source,
        assetId: order.assetId,
        downloadUrl: order.downloadUrl,
        estimatedTime,
        isProcessing,
        canDownload,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        error: order.error
      }
    })

  } catch (error) {
    console.error('[ORDER_STATUS_ERROR]', error)
    return NextResponse.json({ 
      error: 'Failed to fetch order status' 
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const { status, downloadUrl, error } = await request.json()

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status' 
      }, { status: 400 })
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        downloadUrl: downloadUrl || null,
        error: error || null,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        title: updatedOrder.title,
        source: updatedOrder.source,
        assetId: updatedOrder.assetId,
        downloadUrl: updatedOrder.downloadUrl,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        error: updatedOrder.error
      }
    })

  } catch (error) {
    console.error('[ORDER_STATUS_UPDATE_ERROR]', error)
    return NextResponse.json({ 
      error: 'Failed to update order status' 
    }, { status: 500 })
  }
}