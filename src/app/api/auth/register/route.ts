import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, planId } = await request.json()

    console.log('Registration attempt:', { name, email, planId })

    // Validate required fields
    if (!name || !email || !password || !planId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Define plan data
    const planData = {
      'starter': { name: 'starter', description: 'Perfect for individuals and small projects', price: 9.99, points: 50, rolloverLimit: 25 },
      'professional': { name: 'professional', description: 'Ideal for freelancers and small agencies', price: 29.99, points: 200, rolloverLimit: 100 },
      'business': { name: 'business', description: 'Perfect for agencies and design teams', price: 79.99, points: 600, rolloverLimit: 300 },
      'enterprise': { name: 'enterprise', description: 'For large agencies and enterprises', price: 199.99, points: 1500, rolloverLimit: 750 }
    }

    // Get plan info
    const planInfo = planData[planId as keyof typeof planData]
    if (!planInfo) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and subscription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or get subscription plan
      const plan = await tx.subscriptionPlan.upsert({
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

      return { user, subscription, plan }
    })

    console.log('Registration successful:', result.user.email)

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
    return NextResponse.json({ 
      error: 'Registration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}