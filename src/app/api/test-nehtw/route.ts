import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing nehtw API connection...')
    
    if (!process.env.NEHTW_API_KEY) {
      return NextResponse.json({ 
        error: 'NEHTW_API_KEY not configured',
        hasKey: false
      }, { status: 500 })
    }
    
    // Test with the same URL that's failing
    const testUrl = 'https://www.shutterstock.com/image-photo/landscape-misty-panorama-fantastic-dreamy-sunrise-1289741896'
    const nehtwTestUrl = `https://nehtw.com/api/stockinfo/shutterstock/1289741896?url=${encodeURIComponent(testUrl)}`
    
    console.log('Testing URL:', nehtwTestUrl)
    
    const response = await fetch(nehtwTestUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.NEHTW_API_KEY,
        'User-Agent': 'StockMediaSaaS/1.0',
        'Accept': 'application/json'
      }
    })
    
    const responseText = await response.text()
    
    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText,
      hasKey: true,
      keyLength: process.env.NEHTW_API_KEY.length,
      testUrl: nehtwTestUrl
    })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      hasKey: !!process.env.NEHTW_API_KEY
    }, { status: 500 })
  }
}