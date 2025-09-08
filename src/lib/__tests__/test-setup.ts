import { PrismaClient } from '@prisma/client'

// Create a test database instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
})

// Clean up function
export const cleanup = async () => {
  await prisma.pointsHistory.deleteMany()
  await prisma.pointsBalance.deleteMany()
  await prisma.order.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.apiKey.deleteMany()
  await prisma.user.deleteMany()
  await prisma.stockSite.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  await prisma.systemSetting.deleteMany()
}

// Setup function
export const setup = async () => {
  await cleanup()
  
  // Create test data
  await prisma.subscriptionPlan.createMany({
    data: [
      {
        id: 'test-plan-1',
        name: 'Test Starter',
        description: 'Test starter plan',
        price: 9.99,
        points: 50,
        rolloverLimit: 25,
        isActive: true,
      },
      {
        id: 'test-plan-2',
        name: 'Test Professional',
        description: 'Test professional plan',
        price: 29.99,
        points: 200,
        rolloverLimit: 50,
        isActive: true,
      },
    ],
  })

  await prisma.stockSite.createMany({
    data: [
      {
        id: 'test-site-1',
        name: 'shutterstock',
        displayName: 'Shutterstock',
        cost: 0.15,
        isActive: true,
        category: 'photos',
      },
      {
        id: 'test-site-2',
        name: 'adobe',
        displayName: 'Adobe Stock',
        cost: 0.20,
        isActive: true,
        category: 'photos',
      },
    ],
  })

  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'point_cost_usd',
        value: '0.23',
        type: 'number',
      },
      {
        key: 'max_rollover_percentage',
        value: '50',
        type: 'number',
      },
    ],
  })
}

export { prisma }
