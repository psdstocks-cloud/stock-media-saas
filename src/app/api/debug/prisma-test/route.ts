import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testing Prisma client...')
    
    // Test simple query
    const plans = await prisma.subscriptionPlan.findMany({
      take: 1
    })
    
    console.log('Plans found:', plans.length)
    
    return NextResponse.json({
      success: true,
      message: 'Prisma client working',
      plansCount: plans.length
    })
    
  } catch (error) {
    console.error('Prisma test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
