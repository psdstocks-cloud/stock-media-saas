import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/jwt-auth'

const prisma = new PrismaClient()

// GET - Get user's subscriptions
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
      include: {
        plan: true,
        billingHistory: {
          orderBy: { billingDate: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      subscriptions
    })

  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await request.json()
    
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: { 
        userId: user.id,
        status: 'ACTIVE'
      }
    })

    if (existingSubscription) {
      return NextResponse.json({ 
        error: 'User already has an active subscription' 
      }, { status: 400 })
    }

    // Get the plan details
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Calculate billing dates
    const now = new Date()
    const nextMonth = new Date(now)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        nextBillingDate: nextMonth
      },
      include: {
        plan: true
      }
    })

    // Add points to user's account
    const userBalance = await prisma.pointsBalance.findUnique({
      where: { userId: user.id }
    })

    if (userBalance) {
      await prisma.pointsBalance.update({
        where: { userId: user.id },
        data: {
          currentPoints: userBalance.currentPoints + plan.points,
          totalPurchased: userBalance.totalPurchased + plan.points
        }
      })

      // Record in points history
      await prisma.pointsHistory.create({
        data: {
          userId: user.id,
          type: 'SUBSCRIPTION',
          amount: plan.points,
          description: `Monthly subscription: ${plan.name}`
        }
      })
    }

    // Record billing history
    await prisma.billingHistory.create({
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        amount: plan.price,
        currency: plan.currency,
        status: 'SUCCESS',
        description: `Subscription: ${plan.name}`,
        billingDate: now
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription created successfully',
      subscription
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PATCH - Update subscription (cancel, upgrade, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId, action, newPlanId } = await request.json()
    
    if (!subscriptionId || !action) {
      return NextResponse.json({ 
        error: 'Subscription ID and action are required' 
      }, { status: 400 })
    }

    const subscription = await prisma.subscription.findFirst({
      where: { 
        id: subscriptionId,
        userId: user.id
      },
      include: { plan: true }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    let updatedSubscription

    switch (action) {
      case 'cancel':
        updatedSubscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'CANCELED',
            cancelAtPeriodEnd: true,
            canceledAt: new Date()
          },
          include: { plan: true }
        })
        break

      case 'reactivate':
        updatedSubscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'ACTIVE',
            cancelAtPeriodEnd: false,
            canceledAt: null
          },
          include: { plan: true }
        })
        break

      case 'upgrade':
        if (!newPlanId) {
          return NextResponse.json({ 
            error: 'New plan ID is required for upgrade' 
          }, { status: 400 })
        }

        const newPlan = await prisma.subscriptionPlan.findUnique({
          where: { id: newPlanId }
        })

        if (!newPlan) {
          return NextResponse.json({ error: 'New plan not found' }, { status: 404 })
        }

        updatedSubscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            planId: newPlan.id,
            status: 'ACTIVE'
          },
          include: { plan: true }
        })
        break

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Supported actions: cancel, reactivate, upgrade' 
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Subscription ${action} successful`,
      subscription: updatedSubscription
    })

  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
