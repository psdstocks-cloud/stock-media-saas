import { NextRequest, NextResponse } from 'next/server'
import { getUnifiedAuth } from '@/lib/auth/unified'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { taskId } = await request.json()
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }
    
    console.log('Status check for:', taskId)
    
    // Check status with nehtw.com - use correct URL format and method
    const nehtwUrl = `https://nehtw.com/api/order/${taskId}/status?responsetype=any`
    console.log('Calling nehtw API:', nehtwUrl)
    
    const nehtwResponse = await fetch(nehtwUrl, {
      method: 'GET', // nehtw API uses GET method
      headers: {
        'X-Api-Key': process.env.NEHTW_API_KEY || ''
      }
    })
    
    const nehtwData = await nehtwResponse.json()
    console.log('nehtw status response:', nehtwData)
    
    if (nehtwData.success !== false) {
      return NextResponse.json({
        success: true,
        status: nehtwData.status
      })
    } else {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: nehtwData.message
      })
    }
    
  } catch (error) {
    console.error('Stock status error:', error)
    return NextResponse.json({ 
      error: 'Failed to check status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
