import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

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
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, points, price } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
    }

    // Get the plan from hardcoded plans
    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS]

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    let customerId: string
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has a Stripe customer ID
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
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
          userId: session.user.id,
        },
      })
      customerId = customer.id
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: `${plan.name} - ${plan.points} Points`,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Changed from 'subscription' to 'payment' for one-time purchases
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&points=${plan.points}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        planId: plan.id,
        points: plan.points.toString(),
      },
    })

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id 
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
