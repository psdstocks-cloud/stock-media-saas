export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { StockAPI } from '@/lib/stock-api'
import { PointsManager } from '@/lib/points'
import { OrderProcessor } from '@/lib/order-processor'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileInfo } = await request.json()

    if (!fileInfo) {
      return NextResponse.json({ error: 'File information is required' }, { status: 400 })
    }

    console.log('Placing stock order:', fileInfo)

    // Check if user has enough points
    const balance = await PointsManager.getBalance(session.user.id)
    if (!balance || balance.currentPoints < fileInfo.cost) {
      return NextResponse.json({ 
        error: 'Insufficient points',
        required: fileInfo.cost,
        available: balance?.currentPoints || 0
      }, { status: 400 })
    }

    // Get API key
    const rawApiKey = process.env.NEHTW_API_KEY
    const apiKey = rawApiKey ? rawApiKey.replace(/[{}]/g, '') : null // Remove curly braces
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key not configured' 
      }, { status: 500 })
    }

    // Place order
    const result = await StockAPI.placeOrder(session.user.id, fileInfo, apiKey)

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to place order' 
      }, { status: 400 })
    }

    // Deduct points
    await PointsManager.deductPoints(
      session.user.id,
      fileInfo.cost,
      `Download: ${fileInfo.title}`,
      result.orderId!
    )

    console.log('Order placed successfully:', result)

    // Start order processing to monitor status and generate download link
    if (result.taskId) {
      console.log('Starting order processing for taskId:', result.taskId)
      OrderProcessor.startProcessing(
        result.orderId!,
        apiKey,
        fileInfo.site,
        fileInfo.id,
        fileInfo.previewUrl
      ).catch(error => {
        console.error('Failed to start order processing:', error)
        // Update order status to failed if processing fails to start
        OrderProcessor.updateOrderStatus(
          result.orderId!,
          'FAILED',
          `Failed to start processing: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      })
    } else {
      console.error('No taskId received from order placement')
      // Update order status to failed if no taskId
      OrderProcessor.updateOrderStatus(
        result.orderId!,
        'FAILED',
        'No task ID received from order placement'
      )
    }

    return NextResponse.json({
      success: true,
      order: {
        id: result.orderId,
        taskId: result.taskId,
        downloadUrl: result.downloadUrl,
        status: result.taskId ? 'PROCESSING' : 'FAILED'
      },
      warning: result.warning,
      message: result.taskId ? 'Order placed successfully and processing started' : 'Order placed but failed to start processing'
    })

  } catch (error) {
    console.error('Error placing stock order:', error)
    
    let errorMessage = 'Failed to place order'
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'External API connection failed. Please try again later.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 })
  }
}
