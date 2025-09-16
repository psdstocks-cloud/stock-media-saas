import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { OrderManager } from '@/lib/nehtw-api'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id
    const apiKey = process.env.NEHTW_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    console.log('Regenerate download link request for order:', orderId, 'by user:', session.user.id)

    // Regenerate download link
    const updatedOrder = await OrderManager.regenerateDownloadLink(orderId, apiKey)

    console.log('Download link regenerated successfully for order:', orderId)

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      message: 'Download link regenerated successfully' 
    })
  } catch (error) {
    console.error('Error regenerating download link:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate download link'
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 })
  }
}
