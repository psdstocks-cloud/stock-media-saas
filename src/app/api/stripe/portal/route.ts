import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { getUserFromRequest } from '@/lib/jwt-auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Try JWT authentication first (for dashboard)
    const jwtUser = getUserFromRequest(request)
    let userId = jwtUser?.id
    
    // Fallback to NextAuth session if no JWT user
    if (!userId) {
      const session = await auth()
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = session.user.id
    }

    // Get user's Stripe customer ID
    const subscription = await prisma.subscription.findFirst({
      where: { userId: userId },
      select: { stripeCustomerId: true },
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Create Stripe customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/profile`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
