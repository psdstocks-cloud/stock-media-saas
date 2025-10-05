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
    
    console.log('🔍 Status check for:', taskId)
    
    // Try different status URL formats that nehtw might use
    const statusUrls = [
      `https://nehtw.com/api/order/${taskId}/status?responsetype=any`,
      `https://nehtw.com/api/task/${taskId}/status`,
      `https://nehtw.com/api/runtask/${taskId}/status`
    ]
    
    for (const statusUrl of statusUrls) {
      try {
        console.log('🌐 Trying status URL:', statusUrl)
        
        const response = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'X-Api-Key': process.env.NEHTW_API_KEY || '',
            'User-Agent': 'StockMediaSaaS/1.0',
            'Accept': 'application/json'
          }
        })
        
        const responseText = await response.text()
        console.log('📜 Status response:', responseText)
        
        if (response.ok) {
          const data = JSON.parse(responseText)
          
          // If we get a valid response, return it
          if (data.status || data.success !== false) {
            return NextResponse.json({
              success: true,
              status: data.status || 'processing',
              data: data
            })
          }
        }
      } catch (urlError) {
        console.log(`❌ Error with ${statusUrl}:`, urlError)
        continue
      }
    }
    
    // If all status URLs fail, return a processing status (optimistic)
    return NextResponse.json({
      success: true,
      status: 'processing',
      message: 'Status check in progress'
    })
    
  } catch (error) {
    console.error('Stock status error:', error)
    return NextResponse.json({ 
      error: 'Failed to check status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
