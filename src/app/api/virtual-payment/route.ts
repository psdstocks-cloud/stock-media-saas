import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { points, validity, totalPrice, paymentMethod, tier } = await request.json()

    // Validate input
    if (!points || !validity || !totalPrice || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create virtual order record
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        type: 'POINT_PACK',
        status: 'COMPLETED',
        points: points,
        amount: totalPrice,
        currency: 'USD',
        paymentMethod: paymentMethod.toUpperCase(),
        metadata: {
          tier,
          validity,
          virtualPayment: true,
          pricePerPoint: totalPrice / points
        }
      }
    })

    // Add points to user's balance
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + validity)

    await prisma.pointTransaction.create({
      data: {
        userId: session.user.id,
        orderId: order.id,
        type: 'PURCHASE',
        points: points,
        description: `Virtual purchase: ${points} points (${tier} tier)`,
        expirationDate
      }
    })

    // Update user's total points
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        points: {
          increment: points
        }
      }
    })

    // Create virtual payment record for tracking
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalPrice,
        currency: 'USD',
        status: 'SUCCEEDED',
        paymentMethod: paymentMethod.toUpperCase(),
        stripePaymentIntentId: `virtual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          virtualPayment: true,
          tier,
          validity
        }
      }
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      points: points,
      message: 'Virtual payment completed successfully'
    })

  } catch (error) {
    console.error('Virtual payment error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}