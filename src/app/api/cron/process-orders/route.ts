import { NextRequest, NextResponse } from 'next/server'
import { OrderProcessor } from '@/lib/order-processor'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process pending orders
    await OrderProcessor.processPendingOrders()
    
    // Check processing orders
    await OrderProcessor.checkProcessingOrders()
    
    // Clean up old orders
    await OrderProcessor.cleanupOldOrders()

    return NextResponse.json({ 
      success: true, 
      message: 'Order processing completed' 
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ 
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
