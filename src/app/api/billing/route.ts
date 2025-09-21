import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/jwt-auth'

const prisma = new PrismaClient()

// GET - Get user's billing history
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = { userId: user.id }
    if (status) {
      where.status = status
    }

    // Get billing history with pagination
    const [billingHistory, total] = await Promise.all([
      prisma.billingHistory.findMany({
        where,
        include: {
          subscription: {
            include: {
              plan: true
            }
          }
        },
        orderBy: { billingDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.billingHistory.count({ where })
    ])

    // Calculate summary statistics
    const summary = await prisma.billingHistory.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
      _count: { id: true }
    })

    const statusBreakdown = await prisma.billingHistory.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: { id: true },
      _sum: { amount: true }
    })

    return NextResponse.json({
      success: true,
      billingHistory,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        totalAmount: summary._sum.amount || 0,
        totalTransactions: summary._count.id || 0,
        statusBreakdown
      }
    })

  } catch (error) {
    console.error('Error fetching billing history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Process virtual monthly renewal
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId } = await request.json()
    
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 })
    }

    // Get subscription details
    const subscription = await prisma.subscription.findFirst({
      where: { 
        id: subscriptionId,
        userId: user.id,
        status: 'ACTIVE'
      },
      include: { plan: true }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Active subscription not found' }, { status: 404 })
    }

    // Check if it's time for renewal
    const now = new Date()
    if (subscription.nextBillingDate && now < subscription.nextBillingDate) {
      return NextResponse.json({ 
        error: 'Subscription is not due for renewal yet' 
      }, { status: 400 })
    }

    // Process renewal
    const nextBillingDate = new Date(now)
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

    // Update subscription
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        currentPeriodStart: now,
        currentPeriodEnd: nextBillingDate,
        nextBillingDate: nextBillingDate
      }
    })

    // Add monthly points
    const userBalance = await prisma.pointsBalance.findUnique({
      where: { userId: user.id }
    })

    if (userBalance) {
      await prisma.pointsBalance.update({
        where: { userId: user.id },
        data: {
          currentPoints: userBalance.currentPoints + subscription.plan.points,
          totalPurchased: userBalance.totalPurchased + subscription.plan.points
        }
      })

      // Record in points history
      await prisma.pointsHistory.create({
        data: {
          userId: user.id,
          type: 'SUBSCRIPTION_RENEWAL',
          amount: subscription.plan.points,
          description: `Monthly renewal: ${subscription.plan.name}`
        }
      })
    }

    // Record billing history
    await prisma.billingHistory.create({
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        amount: subscription.plan.price,
        currency: subscription.plan.currency,
        status: 'SUCCESS',
        description: `Monthly renewal: ${subscription.plan.name}`,
        billingDate: now
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription renewed successfully',
      nextBillingDate
    })

  } catch (error) {
    console.error('Error processing renewal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
