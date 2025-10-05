import { NextRequest, NextResponse } from 'next/server'
import { getUnifiedAuth } from '@/lib/auth/unified'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { taskId, responseType = 'any' } = await request.json()
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }
    
    console.log('📥 Download request for:', taskId)
    
    // Try different download URL formats
    const downloadUrls = [
      `https://nehtw.com/api/v2/order/${taskId}/download?responsetype=${responseType}`,
      `https://nehtw.com/api/order/${taskId}/download?responsetype=${responseType}`,
      `https://nehtw.com/api/task/${taskId}/download`,
      `https://nehtw.com/api/runtask/${taskId}/download`
    ]
    
    for (const downloadUrl of downloadUrls) {
      try {
        console.log('🌐 Trying download URL:', downloadUrl)
        
        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'X-Api-Key': process.env.NEHTW_API_KEY || '',
            'User-Agent': 'StockMediaSaaS/1.0',
            'Accept': 'application/json'
          }
        })
        
        const responseText = await response.text()
        console.log('📜 Download response:', responseText)
        
        if (response.ok) {
          const data = JSON.parse(responseText)
          
          if (data.downloadLink || data.download_link || data.url) {
            return NextResponse.json({
              success: true,
              downloadLink: data.downloadLink || data.download_link || data.url,
              fileName: data.fileName || data.filename || `stock-${taskId}`,
              linkType: data.linkType || data.type || 'direct'
            })
          }
        }
      } catch (urlError) {
        console.log(`❌ Error with ${downloadUrl}:`, urlError)
        continue
      }
    }
    
    return NextResponse.json({ 
      error: 'No download link available yet',
      message: 'File may still be processing'
    }, { status: 404 })
    
  } catch (error) {
    console.error('Stock download error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate download link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
