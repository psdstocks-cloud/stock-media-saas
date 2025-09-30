import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { getUserFromRequest } from '@/lib/jwt-auth'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type { SubscriptionPlan as _SubscriptionPlan, PointPack as _PointPack } from '@prisma/client'

// Hardcoded pricing plans to match the frontend
const PRICING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    points: 50,
    price: 9.99,
    description: '50 download points for premium stock media'
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    points: 150,
    price: 24.99,
    description: '150 download points with priority support'
  },
  business: {
    id: 'business',
    name: 'Business',
    points: 500,
    price: 69.99,
    description: '500 download points with team collaboration'
  }
}

export async function POST(request: NextRequest) {
  try {
    // Try JWT authentication first (for dashboard)
    const jwtUser = getUserFromRequest(request)
    let userId = jwtUser?.id
    let userEmail = jwtUser?.email
    
    // Fallback to NextAuth session if no JWT user
    if (!userId) {
      const session = await auth()
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = session.user.id
      userEmail = session.user.email || undefined
    }

    const { planId, packId } = await request.json()

    if (!planId && !packId) {
      return NextResponse.json({ error: 'Plan ID or Pack ID is required' }, { status: 400 })
    }

    // Get or create Stripe customer
    let customerId: string | null = null
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has a Stripe customer ID
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: userId },
      select: { stripeCustomerId: true },
    })

    if (existingSubscription?.stripeCustomerId) {
      customerId = existingSubscription.stripeCustomerId
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: userId,
        },
      })
      customerId = customer.id
    }

    let stripePriceId: string
    let line_items: any[]
    let mode: 'subscription' | 'payment'
    let metadata: any = { userId: userId }

    if (packId) {
      // Handle Point Pack Purchase (One-Time Payment)
      const pointPack = await prisma.pointPack.findUnique({ where: { id: packId } })
      if (!pointPack) return NextResponse.json({ error: 'Point Pack not found' }, { status: 404 })
      
      stripePriceId = pointPack.stripePriceId
      mode = 'payment'
      metadata.packId = pointPack.id
      metadata.pointsAmount = pointPack.points.toString()
      
      line_items = [{
        price: stripePriceId,
        quantity: 1,
      }]

    } else if (planId) {
      // Handle Subscription Purchase (Legacy hardcoded plans)
      const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS]
      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
      }

      mode = 'payment' // Changed from 'subscription' to 'payment' for one-time purchases
      metadata.planId = plan.id
      metadata.pointsAmount = plan.points.toString()
      
      line_items = [{
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: `${plan.name} - ${plan.points} Points`,
            description: plan.description,
          },
          unit_amount: Math.round(plan.price * 100), // Convert to cents
        },
        quantity: 1,
      }]
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Create Stripe checkout session
    const sessionParams: any = {
      payment_method_types: ['card'],
      mode: mode,
      billing_address_collection: 'auto',
      customer_email: userEmail,
      line_items: line_items,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/orders?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/pricing?payment=canceled`,
      metadata: metadata,
    }

    // Only add customer if we have a customerId
    if (customerId) {
      sessionParams.customer = customerId
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id 
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
