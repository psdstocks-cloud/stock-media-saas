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
      return NextResponse.json({ error: 'Missing task ID' }, { status: 400 })
    }
    
    // Generate download link with nehtw.com
    const nehtwResponse = await fetch(`https://nehtw.com/api/v2/order/${taskId}/download?responsetype=${responseType}`, {
      headers: {
        'X-Api-Key': process.env.NEHTW_API_KEY || ''
      }
    })
    
    const nehtwData = await nehtwResponse.json()
    
    if (nehtwData.success) {
      return NextResponse.json({
        success: true,
        downloadLink: nehtwData.downloadLink,
        fileName: nehtwData.fileName,
        linkType: nehtwData.linkType
      })
    } else {
      return NextResponse.json({ error: nehtwData.message || 'Failed to generate download link' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Stock download error:', error)
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
  }
}
