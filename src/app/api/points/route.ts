import { NextRequest, NextResponse } from 'next/server'
import { getUnifiedAuth } from '@/lib/auth/unified'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('💰 [Points API] Checking user authentication...')
    
    const user = await getUnifiedAuth(request)
    
    if (!user) {
      console.log('❌ [Points API] No authentication found')
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    console.log('✅ [Points API] User authenticated:', user.email)

    // Get or create points balance
    let pointsBalance = await prisma.pointsBalance.findUnique({
      where: { userId: user.id }
    })

    if (!pointsBalance) {
      console.log('🆕 [Points API] Creating points balance for user:', user.id)
      pointsBalance = await prisma.pointsBalance.create({
        data: {
          userId: user.id,
          currentPoints: user.isAdmin ? 1000 : 100, // Give admin more points
          totalPurchased: user.isAdmin ? 1000 : 100,
          totalUsed: 0,
          lastRollover: new Date()
        }
      })
    }

    // Get recent points history
    const pointsHistory = await prisma.pointsHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true
      }
    })

    console.log('✅ [Points API] Success - Current points:', pointsBalance.currentPoints)

    return NextResponse.json({
      success: true,
      balance: pointsBalance,
      history: pointsHistory,
      summary: {
        currentPoints: pointsBalance.currentPoints,
        totalPurchased: pointsBalance.totalPurchased,
        totalUsed: pointsBalance.totalUsed,
        lastRollover: pointsBalance.lastRollover
      }
    })

  } catch (error) {
    console.error('❌ [Points API] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch points'
    }, { status: 500 })
  }
}