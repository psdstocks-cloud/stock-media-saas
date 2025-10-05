import { NextRequest, NextResponse } from 'next/server'
import { verifyUserAuth } from '@/lib/auth/user'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('💰 Points API called')
    
    const user = await verifyUserAuth(request)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Get or create points balance
    let pointsBalance = await prisma.pointsBalance.findUnique({
      where: { userId: user.id }
    })

    if (!pointsBalance) {
      console.log('🆕 Creating points balance for user:', user.id)
      pointsBalance = await prisma.pointsBalance.create({
        data: {
          userId: user.id,
          currentPoints: user.role === 'SUPER_ADMIN' ? 1000 : 100, // Give admin more points
          totalEarned: user.role === 'SUPER_ADMIN' ? 1000 : 100,
          totalSpent: 0,
          lastUpdated: new Date()
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
        points: true,
        type: true,
        description: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      balance: pointsBalance,
      history: pointsHistory,
      summary: {
        currentPoints: pointsBalance.currentPoints,
        totalEarned: pointsBalance.totalEarned,
        totalSpent: pointsBalance.totalSpent,
        lastUpdated: pointsBalance.lastUpdated
      }
    })

  } catch (error) {
    console.error('❌ Points API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch points'
    }, { status: 500 })
  }
}