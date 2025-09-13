import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { checkRegistrationRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    console.log('Registration API called')
    const { name, email, password, planId } = await request.json()
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

    console.log('Registration attempt:', { name, email, planId, clientIP })
    console.log('Database URL exists:', !!process.env.DATABASE_URL)
    console.log('Database URL starts with:', process.env.DATABASE_URL?.substring(0, 20))

    // Apply rate limiting
    const rateLimitResult = await checkRegistrationRateLimit(clientIP)
    if (!rateLimitResult.success) {
      return NextResponse.json({
        error: 'Too many registration attempts. Please try again later.',
        type: 'RATE_LIMIT_EXCEEDED',
        remaining: rateLimitResult.remaining,
        resetTime: new Date(rateLimitResult.reset).toISOString()
      }, { status: 429 })
    }

    // Validate required fields
    if (!name || !email || !password || !planId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Validate field formats
    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Validate password strength
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return NextResponse.json({ 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      }, { status: 400 })
    }

    // Check if user already exists with enhanced security
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        accounts: true,
        sessions: true
      }
    })

    if (existingUser) {
      // Log suspicious activity
      console.warn('Duplicate registration attempt:', {
        email: email.toLowerCase(),
        existingUserId: existingUser.id,
        hasPassword: !!existingUser.password,
        hasOAuthAccounts: existingUser.accounts.length > 0,
        clientIP,
        timestamp: new Date().toISOString()
      })

      // Check if user has OAuth accounts
      if (existingUser.accounts.length > 0) {
        const providers = existingUser.accounts.map(acc => acc.provider).join(', ')
        return NextResponse.json({ 
          error: `An account with this email already exists. Please sign in using ${providers} or reset your password if you forgot it.`,
          type: 'ACCOUNT_EXISTS_OAUTH',
          providers: existingUser.accounts.map(acc => acc.provider)
        }, { status: 400 })
      }

      // Check if user has password
      if (existingUser.password) {
        return NextResponse.json({ 
          error: 'An account with this email already exists. Please sign in or reset your password if you forgot it.',
          type: 'ACCOUNT_EXISTS_PASSWORD'
        }, { status: 400 })
      }

      // User exists but has no password or OAuth accounts (edge case)
      return NextResponse.json({ 
        error: 'An account with this email already exists. Please contact support.',
        type: 'ACCOUNT_EXISTS_NO_AUTH'
      }, { status: 400 })
    }

    // Define plan data
    const planData = {
      'starter': { name: 'starter', description: 'Perfect for individuals and small projects', price: 9.99, points: 50, rolloverLimit: 25 },
      'professional': { name: 'professional', description: 'Ideal for freelancers and small agencies', price: 29.99, points: 200, rolloverLimit: 100 },
      'business': { name: 'business', description: 'Perfect for agencies and design teams', price: 79.99, points: 600, rolloverLimit: 300 },
      'enterprise': { name: 'enterprise', description: 'For large agencies and enterprises', price: 199.99, points: 1500, rolloverLimit: 750 }
    }

    // Get plan info
    console.log('Plan ID received:', planId)
    console.log('Available plans:', Object.keys(planData))
    const planInfo = planData[planId as keyof typeof planData]
    if (!planInfo) {
      console.log('Invalid plan selected:', planId)
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }
    console.log('Plan info found:', planInfo)

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and subscription in a transaction
    console.log('Starting transaction for user creation...')
    console.log('Testing Prisma connection...')
    try {
      await prisma.$connect()
      console.log('Prisma connected successfully')
    } catch (connectError) {
      console.error('Prisma connection error:', connectError)
      throw connectError
    }
    
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

      // Create user with email normalization
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
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