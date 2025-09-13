import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    
    return NextResponse.json({
      success: true,
      redisConfigured: !!(redisUrl && redisToken),
      urlLength: redisUrl?.length || 0,
      tokenLength: redisToken?.length || 0,
      urlStart: redisUrl?.substring(0, 30) || 'N/A',
      tokenStart: redisToken?.substring(0, 10) || 'N/A',
      urlEnd: redisUrl?.substring(-10) || 'N/A',
      tokenEnd: redisToken?.substring(-10) || 'N/A'
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
