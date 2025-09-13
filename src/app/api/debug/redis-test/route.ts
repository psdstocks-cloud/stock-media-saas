import { NextResponse } from 'next/server'
import { rateLimiters } from '@/lib/rate-limit'

export async function GET() {
  try {
    console.log('Testing Redis connection...')
    
    if (!rateLimiters) {
      return NextResponse.json({
        success: false,
        message: 'Redis not configured - rate limiters are null',
        redisAvailable: false
      })
    }
    
    // Test rate limiting with a dummy identifier
    const testResult = await rateLimiters.auth.limit('test-identifier')
    
    return NextResponse.json({
      success: true,
      message: 'Redis connection successful!',
      redisAvailable: true,
      testResult: {
        success: testResult.success,
        limit: testResult.limit,
        remaining: testResult.remaining,
        reset: new Date(testResult.reset).toISOString()
      }
    })
    
  } catch (error) {
    console.error('Redis test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Redis connection failed',
      redisAvailable: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
