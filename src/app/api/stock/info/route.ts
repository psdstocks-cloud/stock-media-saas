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
    
    // Call nehtw.com API
    const nehtwResponse = await fetch(`https://nehtw.com/api/stockinfo/${site}/${id}?url=${encodeURIComponent(url)}`, {
      headers: {
        'X-Api-Key': process.env.NEHTW_API_KEY || ''
      }
    })
    
    const nehtwData = await nehtwResponse.json()
    
    if (nehtwData.success) {
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
      return NextResponse.json({ error: nehtwData.data || 'Failed to get stock information' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Stock info error:', error)
    return NextResponse.json({ error: 'Failed to get stock information' }, { status: 500 })
  }
}
