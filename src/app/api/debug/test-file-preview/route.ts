import { NextRequest, NextResponse } from 'next/server'
import { ComprehensiveUrlParser } from '@/lib/comprehensive-url-parser'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Test URL parsing
    const parsedData = ComprehensiveUrlParser.parseUrl(url)
    console.log('Parsed data:', parsedData)

    if (!parsedData) {
      return NextResponse.json({ 
        error: 'Invalid URL format. Please provide a valid stock media URL from supported sites.' 
      }, { status: 400 })
    }

    // Generate mock file info
    const fileInfo = {
      id: parsedData.id,
      site: parsedData.source,
      title: `${parsedData.source.charAt(0).toUpperCase() + parsedData.source.slice(1)} - ${parsedData.id}`,
      image: 'https://images.unsplash.com/photo-1506905925346-14bda5d4c4c0?w=400&h=300&fit=crop',
      previewUrl: 'https://images.unsplash.com/photo-1506905925346-14bda5d4c4c0?w=400&h=300&fit=crop',
      cost: 10,
      size: 'Unknown',
      format: 'Unknown',
      author: 'Unknown',
      isAvailable: true
    }

    return NextResponse.json({
      success: true,
      fileInfo
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
