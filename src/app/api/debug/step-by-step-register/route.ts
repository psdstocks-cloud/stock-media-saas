import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, planId } = await request.json()
    
    console.log('Step-by-step registration attempt:', { name, email, planId })
    
    // Validate required fields
    if (!name || !email || !password || !planId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    
    // Hash password
    console.log('Step 1: Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('Password hashed successfully')
    
    // Create user
    console.log('Step 2: Creating user...')
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      }
    })
    console.log('User created successfully:', user.id)
    
    // Try to create subscription plan
    console.log('Step 3: Creating/finding subscription plan...')
    const planData = {
      'starter': { name: 'starter', description: 'Perfect for individuals and small projects', price: 9.99, points: 50, rolloverLimit: 25 },
      'professional': { name: 'professional', description: 'Ideal for freelancers and small agencies', price: 29.99, points: 200, rolloverLimit: 100 },
      'business': { name: 'business', description: 'Perfect for agencies and design teams', price: 79.99, points: 600, rolloverLimit: 300 },
      'enterprise': { name: 'enterprise', description: 'For large agencies and enterprises', price: 199.99, points: 1500, rolloverLimit: 750 }
    }
    
    const planInfo = planData[planId as keyof typeof planData]
    if (!planInfo) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }
    
    const plan = await prisma.subscriptionPlan.upsert({
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
    console.log('Plan created/found successfully:', plan.id)
    
    // Try to create subscription
    console.log('Step 4: Creating subscription...')
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    })
    console.log('Subscription created successfully:', subscription.id)
    
    // Try to create points balance
    console.log('Step 5: Creating points balance...')
    const pointsBalance = await prisma.pointsBalance.create({
      data: {
        userId: user.id,
        currentPoints: plan.points,
        totalPurchased: plan.points,
      }
    })
    console.log('Points balance created successfully:', pointsBalance.id)
    
    // Try to create points history
    console.log('Step 6: Creating points history...')
    await prisma.pointsHistory.create({
      data: {
        userId: user.id,
        type: 'SUBSCRIPTION',
        amount: plan.points,
        description: `Initial subscription points for ${plan.name} plan`,
      }
    })
    console.log('Points history created successfully')
    
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      },
      plan: {
        id: plan.id,
        name: plan.name
      },
      subscription: {
        id: subscription.id
      },
      pointsBalance: {
        id: pointsBalance.id
      }
    })
    
  } catch (error) {
    console.error('Step-by-step registration error:', error)
    return NextResponse.json({ 
      error: 'Registration failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
