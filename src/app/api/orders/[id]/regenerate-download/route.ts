import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { OrderManager } from '@/lib/nehtw-api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user session
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: orderId } = await params

    // Get the order
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

    // Allow regeneration for any order that has a taskId (regardless of status)
    // This ensures users can redownload their files anytime for free
    if (!order.taskId) {
      console.error('Order has no taskId:', {
        orderId: order.id,
        status: order.status,
        taskId: order.taskId,
        stockItemId: order.stockItemId,
        hasDownloadUrl: !!order.downloadUrl
      })
      
      // If we have an existing downloadUrl, use it as fallback
      if (order.downloadUrl) {
        console.log('Using existing download URL as fallback for order without taskId:', order.downloadUrl)
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

    console.log('Order taskId validation passed:', {
      orderId: order.id,
      taskId: order.taskId,
      taskIdType: typeof order.taskId,
      taskIdLength: order.taskId?.length
    })

    // Generate fresh download link using OrderManager
    // This is a FREE redownload - no points are deducted
    try {
      // Get API key from environment or user settings
      const apiKey = process.env.NEHTW_API_KEY
      if (!apiKey || apiKey === 'your-nehtw-api-key-here') {
        console.error('NEHTW_API_KEY not configured or using placeholder value')
        console.error('API Key value:', apiKey)
        
        // If we have an existing downloadUrl, use it as fallback
        if (order.downloadUrl) {
          console.log('Using existing download URL as fallback:', order.downloadUrl)
          return NextResponse.json({ 
            success: true, 
            downloadUrl: order.downloadUrl,
            warning: 'Using existing download link - API key not configured'
          })
        }
        
        return NextResponse.json({ 
          error: 'API key not configured - please contact support' 
        }, { status: 500 })
      }

      console.log('Attempting to regenerate download link for order:', orderId)
      console.log('Order details:', {
        id: order.id,
        taskId: order.taskId,
        status: order.status,
        currentDownloadUrl: order.downloadUrl
      })

      const updatedOrder = await OrderManager.regenerateDownloadLink(
        orderId,
        apiKey
      )

      console.log('Regeneration result:', {
        success: !!updatedOrder,
        hasDownloadUrl: !!(updatedOrder && updatedOrder.downloadUrl),
        downloadUrl: updatedOrder?.downloadUrl
      })

      if (updatedOrder && updatedOrder.downloadUrl) {
        return NextResponse.json({ 
          success: true, 
          downloadUrl: updatedOrder.downloadUrl 
        })
      } else {
        console.error('Failed to generate fresh download link - no downloadUrl in result')
        return NextResponse.json({ 
          error: 'Failed to generate fresh download link - no download URL returned' 
        }, { status: 500 })
      }
    } catch (apiError) {
      console.error('API Error generating fresh download link:', apiError)
      console.error('Error details:', {
        message: apiError instanceof Error ? apiError.message : 'Unknown error',
        stack: apiError instanceof Error ? apiError.stack : undefined,
        orderId: orderId
      })
      
      // If API fails, try to use existing downloadUrl if it exists
      if (order.downloadUrl) {
        console.log('Falling back to existing download URL:', order.downloadUrl)
        return NextResponse.json({ 
          success: true, 
          downloadUrl: order.downloadUrl,
          warning: 'Using existing download link due to API error'
        })
      }
      
      return NextResponse.json({ 
        error: `Failed to generate fresh download link: ${apiError instanceof Error ? apiError.message : 'Unknown error'}` 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error regenerating download link:', error)
    return NextResponse.json({ 
      error: 'Failed to regenerate download link' 
    }, { status: 500 })
  }
}
