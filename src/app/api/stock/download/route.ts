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
    
    console.log('Download request for:', taskId)
    
    // Generate download link with nehtw.com - use correct URL format and method
    const nehtwUrl = `https://nehtw.com/api/v2/order/${taskId}/download?responsetype=${responseType}`
    console.log('Calling nehtw API:', nehtwUrl)
    
    const nehtwResponse = await fetch(nehtwUrl, {
      method: 'GET', // nehtw API uses GET method
      headers: {
        'X-Api-Key': process.env.NEHTW_API_KEY || ''
      }
    })
    
    const nehtwData = await nehtwResponse.json()
    console.log('nehtw download response:', nehtwData)
    
    if (nehtwData.success && nehtwData.downloadLink) {
      return NextResponse.json({
        success: true,
        downloadLink: nehtwData.downloadLink,
        fileName: nehtwData.fileName,
        linkType: nehtwData.linkType
      })
    } else {
      return NextResponse.json({ 
        error: nehtwData.message || 'Failed to generate download link',
        details: nehtwData
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Stock download error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate download link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
