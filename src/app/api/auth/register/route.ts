import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { PointsManager } from '@/lib/points'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, planId } = await request.json()

    // Validate required fields
    if (!name || !email || !password || !planId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Registration attempt:', { name, email, planId })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Get or create the selected plan
    let plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    // If plan not found, try to find by name (for fallback plans)
    if (!plan) {
      const planName = planId.replace('-fallback', '')
      plan = await prisma.subscriptionPlan.findUnique({
        where: { name: planName }
      })
    }

    // If still not found, create the plan
    if (!plan) {
      const planData = {
        'starter': { name: 'starter', description: 'Perfect for individuals and small projects', price: 9.99, points: 50, rolloverLimit: 25 },
        'professional': { name: 'professional', description: 'Ideal for freelancers and small agencies', price: 29.99, points: 200, rolloverLimit: 100 },
        'business': { name: 'business', description: 'Perfect for agencies and design teams', price: 79.99, points: 600, rolloverLimit: 300 },
        'enterprise': { name: 'enterprise', description: 'For large agencies and enterprises', price: 199.99, points: 1500, rolloverLimit: 750 }
      }
      
      const planName = planId.replace('-fallback', '')
      const planInfo = planData[planName as keyof typeof planData]
      
      if (planInfo) {
        plan = await prisma.subscriptionPlan.upsert({
          where: { name: planInfo.name },
          update: {},
          create: {
            name: planInfo.name,
            description: planInfo.description,
            price: planInfo.price,
            points: planInfo.points,
            rolloverLimit: planInfo.rolloverLimit,
            isActive: true
          }
        })
      }
    }

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and subscription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        }
      })

      // Create subscription
      const subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }
      })

      // Initialize points balance with subscription points
      const pointsBalance = await tx.pointsBalance.create({
        data: {
          userId: user.id,
          currentPoints: plan.points,
          totalPurchased: plan.points,
        }
      })

      // Create points history entry
      await tx.pointsHistory.create({
        data: {
          userId: user.id,
          type: 'SUBSCRIPTION',
          amount: plan.points,
          description: `Initial subscription points for ${plan.name} plan`,
        }
      })

      return { user, subscription }
    })

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: result.user.id, 
        name: result.user.name, 
        email: result.user.email 
      } 
    })
  } catch (error) {
    console.error('Registration error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json({ 
      error: 'Registration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
