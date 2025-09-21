import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSubscriptionStatus() {
  try {
    console.log('Checking subscription system status...')
    
    // Check subscription plans
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    })
    
    console.log('\n📋 Subscription Plans:')
    plans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price}/${plan.billingCycle.toLowerCase()} (${plan.points} points)`)
    })
    
    // Check active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      include: {
        plan: true,
        user: {
          select: { email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('\n👥 Active Subscriptions:')
    subscriptions.forEach(sub => {
      console.log(`- ${sub.user.email} (${sub.user.name}): ${sub.plan.name} - Status: ${sub.status}`)
    })
    
    // Check billing history
    const billingHistory = await prisma.billingHistory.findMany({
      include: {
        subscription: {
          include: { plan: true }
        }
      },
      orderBy: { billingDate: 'desc' },
      take: 5
    })
    
    console.log('\n💰 Recent Billing History:')
    billingHistory.forEach(billing => {
      const planName = billing.subscription?.plan.name || 'N/A'
      console.log(`- ${billing.description}: $${billing.amount} (${billing.status})`)
    })
    
  } catch (error) {
    console.error('Error checking subscription status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubscriptionStatus()
