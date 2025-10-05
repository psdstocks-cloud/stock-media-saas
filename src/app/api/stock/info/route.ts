import { NextRequest, NextResponse } from 'next/server'
import { getUnifiedAuth } from '@/lib/auth/unified'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { site, id, url } = await request.json()
    
    if (!site || !id || !url) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }
    
    console.log('Info request:', { site, id, url })
    
    // Call nehtw.com API - use correct URL format and method
    const nehtwUrl = `https://nehtw.com/api/stockinfo/${site}/${id}?url=${encodeURIComponent(url)}`
    console.log('Calling nehtw API:', nehtwUrl)
    
    const nehtwResponse = await fetch(nehtwUrl, {
      method: 'GET', // nehtw API uses GET method
      headers: {
        'X-Api-Key': process.env.NEHTW_API_KEY || ''
      }
    })
    
    const nehtwData = await nehtwResponse.json()
    console.log('nehtw API response:', nehtwData)
    
    if (nehtwData.success && nehtwData.data) {
      return NextResponse.json({
        success: true,
        stockInfo: {
          id: nehtwData.data.id,
          title: nehtwData.data.title,
          source: nehtwData.data.source,
          cost: nehtwData.data.cost,
          ext: nehtwData.data.ext,
          name: nehtwData.data.name,
          author: nehtwData.data.author,
          sizeInBytes: nehtwData.data.sizeInBytes,
          thumbnail: nehtwData.data.image
        }
      })
    } else {
      console.error('nehtw API error:', nehtwData)
      return NextResponse.json({ 
        error: nehtwData.data || nehtwData.message || 'Failed to get stock information',
        details: nehtwData
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Stock info error:', error)
    return NextResponse.json({ 
      error: 'Failed to get stock information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
