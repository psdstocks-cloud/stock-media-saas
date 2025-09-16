import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { PointsManager } from '@/lib/points'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { userId, planId, packId, pointsAmount } = session.metadata as {
        userId: string;
        planId?: string;
        packId?: string;
        pointsAmount?: string;
      };

      if (packId && pointsAmount) {
        // Handle successful one-time point pack purchase
        await prisma.pointsBalance.upsert({
          where: { userId },
          update: {
            currentPoints: { increment: parseInt(pointsAmount, 10) },
          },
          create: {
            userId,
            currentPoints: parseInt(pointsAmount, 10),
            totalPurchased: parseInt(pointsAmount, 10),
          },
        });
        
        // Create a history record
        await prisma.pointsHistory.create({
          data: {
            userId,
            type: 'PURCHASE_PACK',
            amount: parseInt(pointsAmount, 10),
            description: `Purchased point pack.`
          }
        });

      } else if (planId) {
        // Handle successful subscription creation (legacy)
        await handleOneTimePayment(session)
      }
      break
    }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          await handleSubscriptionRenewal(invoice)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  const { userId, points, type, pointPackId, planId } = session.metadata!
  
  if (!userId || !points) {
    console.error('Missing metadata in one-time payment:', session.metadata)
    return
  }

  // Handle point pack purchases
  if (type === 'point_pack' && pointPackId) {
    await PointsManager.addPoints(
      userId,
      parseInt(points),
      'PURCHASE',
      `Point pack purchase: ${points} points`
    )
    console.log(`Added ${points} points to user ${userId} for point pack ${pointPackId}`)
  } 
  // Handle subscription plan purchases (legacy)
  else if (planId) {
    await PointsManager.addPoints(
      userId,
      parseInt(points),
      'PURCHASE',
      `One-time purchase: ${planId} plan - ${points} points`
    )
    console.log(`Added ${points} points to user ${userId} for ${planId} plan`)
  }
  else {
    console.error('Unknown payment type or missing metadata:', session.metadata)
  }
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  const { userId, planId } = session.metadata!
  const subscriptionId = session.subscription as string

  // Get the subscription details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  })

  if (!plan) {
    console.error('Plan not found:', planId)
    return
  }

  // Create or update subscription in database
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscriptionId },
    update: {
      status: 'ACTIVE',
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    },
    create: {
      userId: userId!,
      planId: planId!,
      stripeCustomerId: stripeSubscription.customer as string,
      stripeSubscriptionId: subscriptionId,
      status: 'ACTIVE',
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    },
  })

  // Add initial points to user
  await PointsManager.addPoints(
    userId!,
    plan.points,
    'SUBSCRIPTION',
    `Initial subscription points for ${plan.name} plan`
  )
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const status = subscription.status === 'active' ? 'ACTIVE' : 'CANCELED'

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  })
}

async function handleSubscriptionRenewal(invoice: Stripe.Invoice) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string },
    include: { plan: true },
  })

  if (!subscription) {
    console.error('Subscription not found for renewal:', invoice.subscription)
    return
  }

  // Process subscription renewal with rollover
  await PointsManager.processSubscriptionRenewal(
    subscription.userId,
    subscription.planId,
    subscription.plan.points
  )

  // Update subscription period
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      currentPeriodStart: new Date(invoice.period_start * 1000),
      currentPeriodEnd: new Date(invoice.period_end * 1000),
    },
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: invoice.subscription as string },
    data: {
      status: 'PAST_DUE',
    },
  })
}
