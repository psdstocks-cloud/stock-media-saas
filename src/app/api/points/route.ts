import { NextRequest, NextResponse } from 'next/server'
import { PointsManager } from '@/lib/points'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const [balance, history] = await Promise.all([
      PointsManager.getBalance(userId),
      PointsManager.getHistory(userId, 50),
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
