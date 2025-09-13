import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if subscription plans exist
    const plans = await prisma.subscriptionPlan.findMany()
    
    // Check if users table is accessible
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        points: plan.points,
        rolloverLimit: plan.rolloverLimit,
        isActive: plan.isActive
      })),
      userCount,
      databaseConnected: true
    })
  } catch (error) {
    console.error('Debug registration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseConnected: false
    }, { status: 500 })
  }
}
