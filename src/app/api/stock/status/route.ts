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
      return NextResponse.json({ error: 'Missing task ID' }, { status: 400 })
    }
    
    // Check status with nehtw.com
    const nehtwResponse = await fetch(`https://nehtw.com/api/order/${taskId}/status?responsetype=any`, {
      headers: {
        'X-Api-Key': process.env.NEHTW_API_KEY || ''
      }
    })
    
    const nehtwData = await nehtwResponse.json()
    
    if (nehtwData.success) {
      return NextResponse.json({
        success: true,
        status: nehtwData.status
      })
    } else {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: nehtwData.message || 'Failed to check status'
      })
    }
    
  } catch (error) {
    console.error('Stock status error:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
