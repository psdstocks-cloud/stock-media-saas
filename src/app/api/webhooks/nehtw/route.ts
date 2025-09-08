import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PointsManager } from '@/lib/points'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify webhook signature if needed
    // const signature = request.headers.get('x-nehtw-signature')
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const { task_id, status, download_link, file_name, error_message } = body

    if (!task_id) {
      return NextResponse.json({ error: 'Missing task_id' }, { status: 400 })
    }

    // Find the order by task ID
    const order = await prisma.order.findFirst({
      where: { taskId: task_id },
      include: { user: true, stockSite: true },
    })

    if (!order) {
      console.error('Order not found for task_id:', task_id)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order based on status
    if (status === 'ready' && download_link) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'READY',
          downloadUrl: download_link,
          fileName: file_name,
        },
      })
    } else if (status === 'failed' || error_message) {
      // Refund points for failed orders
      await PointsManager.refundPoints(
        order.userId,
        order.id,
        order.cost,
        error_message || 'Order failed'
      )

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'FAILED',
        },
      })
    } else if (status === 'processing') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PROCESSING',
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
