import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/userAuth'
import { PointsManager } from '@/lib/points'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Get user ID from session if not provided in query params
    let finalUserId = userId
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

    const [balance, history] = await Promise.all([
      PointsManager.getBalance(finalUserId),
      PointsManager.getHistory(finalUserId, 50),
    ])

    return NextResponse.json({ balance, history })
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
