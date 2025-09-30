import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check if we can access environment variables
    const hasRequiredEnvVars = !!(
      process.env.NEXTAUTH_SECRET &&
      process.env.DATABASE_URL
    )

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: hasRequiredEnvVars ? 'configured' : 'incomplete',
      version: '1.0.0'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}