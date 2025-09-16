import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { pointPackId } = await request.json();

    if (!pointPackId) {
      return NextResponse.json(
        { message: 'Point pack ID is required' },
        { status: 400 }
      );
    }

    // Get the point pack
    const pointPack = await prisma.pointPack.findUnique({
      where: { id: pointPackId },
    });

    if (!pointPack || !pointPack.isActive) {
      return NextResponse.json(
        { message: 'Point pack not found or inactive' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let customerId: string;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if user already has a Stripe customer ID
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (existingSubscription?.stripeCustomerId) {
      customerId = existingSubscription.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: pointPack.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/pricing?success=true&points=${pointPack.points}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/pricing?cancelled=true`,
      metadata: {
        userId: session.user.id,
        pointPackId: pointPack.id,
        points: pointPack.points.toString(),
        type: 'point_pack',
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('[STRIPE_CHECKOUT_POINT_PACK_ERROR]', error);
    return NextResponse.json(
      { message: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
