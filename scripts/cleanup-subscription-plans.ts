import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupSubscriptionPlans() {
  try {
    console.log('Cleaning up subscription plans...')
    
    // Delete all existing plans
    await prisma.subscriptionPlan.deleteMany()
    console.log('✅ Cleared all existing subscription plans')
    
    // Create clean, consistent plans
    const plans = [
      {
        name: 'Starter',
        description: 'Perfect for individuals and small projects',
        price: 9.99,
        currency: 'USD',
        points: 100,
        rolloverLimit: 50,
        billingCycle: 'MONTHLY',
        isActive: true
      },
      {
        name: 'Pro',
        description: 'Most popular choice for professionals',
        price: 29.99,
        currency: 'USD',
        points: 500,
        rolloverLimit: 200,
        billingCycle: 'MONTHLY',
        isActive: true
      },
      {
        name: 'Team',
        description: 'For teams and agencies',
        price: 79.99,
        currency: 'USD',
        points: 1500,
        rolloverLimit: 500,
        billingCycle: 'MONTHLY',
        isActive: true
      },
      {
        name: 'Enterprise',
        description: 'For large organizations with custom needs',
        price: 199.99,
        currency: 'USD',
        points: 5000,
        rolloverLimit: 2000,
        billingCycle: 'MONTHLY',
        isActive: true
      }
    ]
    
    for (const plan of plans) {
      await prisma.subscriptionPlan.create({ data: plan })
      console.log(`✅ Created: ${plan.name} - $${plan.price}/${plan.billingCycle.toLowerCase()} (${plan.points} points)`)
    }
    
    console.log('\n📋 Final subscription plans:')
    const allPlans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    })
    
    allPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price}/${plan.billingCycle.toLowerCase()} (${plan.points} points, ${plan.rolloverLimit} rollover)`)
    })
    
  } catch (error) {
    console.error('Error cleaning up subscription plans:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupSubscriptionPlans()
