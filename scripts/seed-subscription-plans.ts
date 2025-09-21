import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSubscriptionPlans() {
  try {
    console.log('Seeding subscription plans...')

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

    for (const planData of plans) {
      const existingPlan = await prisma.subscriptionPlan.findUnique({
        where: { name: planData.name }
      })

      if (existingPlan) {
        console.log(`Plan "${planData.name}" already exists, updating...`)
        await prisma.subscriptionPlan.update({
          where: { id: existingPlan.id },
          data: planData
        })
      } else {
        console.log(`Creating plan "${planData.name}"...`)
        await prisma.subscriptionPlan.create({
          data: planData
        })
      }
    }

    console.log('✅ Subscription plans seeded successfully!')
    
    // Display all plans
    const allPlans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    })
    
    console.log('\n📋 Current subscription plans:')
    allPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price}/${plan.billingCycle.toLowerCase()} (${plan.points} points)`)
    })

  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedSubscriptionPlans()
