import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { PointsManager } from '@/lib/points'
import { getUserFromRequest } from '@/lib/jwt-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Try JWT authentication first (for dashboard)
    const jwtUser = getUserFromRequest(request)
    let finalUserId = userId || jwtUser?.id
    
    // Fallback to NextAuth session if no JWT user
    if (!finalUserId) {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      finalUserId = session.user.id
    }

    if (!finalUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const [balance, history, rolloverRecords] = await Promise.all([
      PointsManager.getBalance(finalUserId),
      PointsManager.getHistory(finalUserId, 50),
      PointsManager.getRolloverRecords(finalUserId),
    ])

    // Get subscription info
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: finalUserId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate rollover amount
    const totalRolloverAmount = rolloverRecords.reduce((sum, record) => sum + record.amount, 0)
    const nextRolloverDate = rolloverRecords[0]?.expiresAt || null

    // Format response to match component expectations
    const responseData = {
      currentPoints: balance?.currentPoints || 0,
      totalPurchased: balance?.totalPurchased || 0,
      totalUsed: balance?.totalUsed || 0,
      monthlyAllocation: subscription?.plan?.points || 0,
      rolloverAmount: totalRolloverAmount,
      rolloverDate: nextRolloverDate,
      subscriptionPlan: subscription?.plan ? {
        name: subscription.plan.name,
        monthlyPoints: subscription.plan.points,
        rolloverPercentage: subscription.plan.rolloverLimit,
      } : null,
    }

    return NextResponse.json({ 
      points: responseData.currentPoints,
      data: responseData 
    })
  } catch (error) {
    console.error('Error fetching points data:', error)
    return NextResponse.json({ error: 'Failed to fetch points data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, type, description } = await request.json()

    if (!userId || !amount || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const balance = await PointsManager.addPoints(
      userId,
      amount,
      type as any,
      description
    )

    return NextResponse.json({ success: true, balance })
  } catch (error) {
    console.error('Error adding points:', error)
    return NextResponse.json({ error: 'Failed to add points' }, { status: 500 })
  }
}
