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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Get the selected plan
    let plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    // If plan not found and it's a fallback plan, create it
    if (!plan && planId.includes('-fallback')) {
      const planName = planId.replace('-fallback', '')
      const fallbackPlans = {
        'starter-fallback': { name: 'starter', description: 'Perfect for individuals and small projects', price: 9.99, points: 50, rolloverLimit: 25 },
        'professional-fallback': { name: 'professional', description: 'Ideal for freelancers and small agencies', price: 29.99, points: 200, rolloverLimit: 100 },
        'business-fallback': { name: 'business', description: 'Perfect for agencies and design teams', price: 79.99, points: 600, rolloverLimit: 300 },
        'enterprise-fallback': { name: 'enterprise', description: 'For large agencies and enterprises', price: 199.99, points: 1500, rolloverLimit: 750 }
      }
      
      const fallbackPlan = fallbackPlans[planId as keyof typeof fallbackPlans]
      if (fallbackPlan) {
        plan = await prisma.subscriptionPlan.create({
          data: {
            name: fallbackPlan.name,
            description: fallbackPlan.description,
            price: fallbackPlan.price,
            points: fallbackPlan.points,
            rolloverLimit: fallbackPlan.rolloverLimit,
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
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
