import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user session
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id

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

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        downloadUrl: order.downloadUrl,
        fileName: order.fileName,
        taskId: order.taskId,
        title: order.title,
        cost: order.cost,
        createdAt: order.createdAt,
        stockSite: order.stockSite
      }
    })

  } catch (error) {
    console.error('Error getting order status:', error)
    return NextResponse.json({ 
      error: 'Failed to get order status' 
    }, { status: 500 })
  }
}