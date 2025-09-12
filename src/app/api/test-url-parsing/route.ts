import { NextRequest, NextResponse } from 'next/server'
import { StockAPI } from '@/lib/stock-api'

export async function POST(request: NextRequest) {
  try {
    const { url, fullPreview } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Testing URL parsing for:', url)

    // Test URL parsing
    const fileInfo = StockAPI.extractFileInfo(url)
    console.log('URL parsing result:', fileInfo)

    let previewResult = null
    if (fullPreview && fileInfo) {
      console.log('Testing full preview functionality...')
      previewResult = await StockAPI.getFilePreview(url)
      console.log('Full preview result:', previewResult)
    }

    return NextResponse.json({
      success: true,
      url,
      fileInfo,
      previewResult,
      message: fileInfo ? 'URL parsed successfully' : 'Failed to parse URL'
    })

  } catch (error) {
    console.error('Error testing URL parsing:', error)
    return NextResponse.json({ 
      error: 'Failed to test URL parsing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
