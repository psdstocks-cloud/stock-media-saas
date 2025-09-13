import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export async function GET() {
  let redis: Redis | null = null
  
  try {
    console.log('Testing Redis ping...')
    
    // Create Redis client
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    
    // Test simple ping
    const result = await redis.ping()
    console.log('Redis ping result:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Redis ping successful!',
      pingResult: result
    })
    
  } catch (error) {
    console.error('Redis ping error:', error)
    return NextResponse.json({
      success: false,
      message: 'Redis ping failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
