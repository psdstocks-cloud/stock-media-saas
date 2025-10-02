import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('Virtual payment API called')
    const session = await auth()
    console.log('Session check:', { hasSession: !!session, userId: session?.user?.id })
    
    if (!session?.user?.id) {
      console.log('Unauthorized: No session or user ID')
      return NextResponse.json({ error: 'Unauthorized - Please log in to make a payment' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Payment request body:', body)
    const { points, validity, totalPrice, paymentMethod, tier } = body

    // Validate input
    if (!points || !validity || !totalPrice || !paymentMethod) {
      console.log('Missing required fields:', { points, validity, totalPrice, paymentMethod })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate a unique transaction ID for tracking
    const transactionId = `virtual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Add points to user's points history
    const pointsHistory = await prisma.pointsHistory.create({
      data: {
        userId: session.user.id,
        type: 'PURCHASE',
        amount: points,
        description: `Virtual purchase: ${points} points (${tier} tier) - $${totalPrice} via ${paymentMethod}`
      }
    })

    // Update or create points balance record
    await prisma.pointsBalance.upsert({
      where: { userId: session.user.id },
      update: {
        currentPoints: {
          increment: points
        },
        totalPurchased: {
          increment: points
        }
      },
      create: {
        userId: session.user.id,
        currentPoints: points,
        totalPurchased: points,
        totalUsed: 0
      }
    })

    const response = {
      success: true,
      transactionId: transactionId,
      pointsHistoryId: pointsHistory.id,
      points: points,
      message: 'Virtual payment completed successfully'
    }
    
    console.log('Payment successful, returning:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Virtual payment error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}