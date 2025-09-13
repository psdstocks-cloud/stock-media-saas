import { NextRequest, NextResponse } from 'next/server'
import { UrlParser } from '@/lib/url-parser'

export async function GET(request: NextRequest) {
  try {
    const testUrl = 'https://www.shutterstock.com/image-photo/landscape-misty-panorama-fantastic-dreamy-sunrise-1289741896'
    
    const result = UrlParser.parseUrl(testUrl)
    
    return NextResponse.json({
      success: true,
      url: testUrl,
      parsed: result,
      isValid: !!result
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
