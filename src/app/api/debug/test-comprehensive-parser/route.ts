import { NextRequest, NextResponse } from 'next/server'
import { ComprehensiveUrlParser } from '@/lib/comprehensive-url-parser'

export async function GET(request: NextRequest) {
  try {
    const testUrls = [
      'https://www.shutterstock.com/image-photo/landscape-misty-panorama-fantastic-dreamy-sunrise-1289741896',
      'https://www.shutterstock.com/image-vector/abstract-geometric-background-1234567890',
      'https://stock.adobe.com/images/123456789',
      'https://depositphotos.com/123456789/stock-photo-test.html',
      'https://www.freepik.com/free-photo/test_123456789.htm',
      'https://www.istockphoto.com/photo/test-gm1234567890-',
      'https://unsplash.com/photos/test123',
      'https://www.pexels.com/photo/test-1234567890/'
    ]

    const results = testUrls.map(url => {
      const parsed = ComprehensiveUrlParser.parseUrl(url)
      return {
        url,
        parsed,
        isSupported: ComprehensiveUrlParser.isSupported(url)
      }
    })

    return NextResponse.json({
      success: true,
      results,
      totalPatterns: ComprehensiveUrlParser.getSupportedPatterns().length
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
