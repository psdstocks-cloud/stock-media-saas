// Test script to debug profile issues
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testProfile() {
  try {
    console.log('🔍 Testing profile data structure...')
    
    // Test if we can connect to the database
    const userCount = await prisma.user.count()
    console.log(`✅ Database connected. Total users: ${userCount}`)
    
    // Get a sample user
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        pointsBalance: {
          select: {
            currentPoints: true,
            totalPurchased: true,
            totalUsed: true,
            lastRollover: true
          }
        },
        subscriptions: {
          include: {
            plan: {
              select: {
                name: true,
                price: true,
                points: true
              }
            }
          },
          where: {
            status: 'ACTIVE'
          }
        }
      }
    })
    
    if (sampleUser) {
      console.log('✅ Sample user found:')
      console.log(JSON.stringify(sampleUser, null, 2))
    } else {
      console.log('❌ No users found in database')
    }
    
    // Test points balance structure
    const pointsBalance = await prisma.pointsBalance.findFirst()
    if (pointsBalance) {
      console.log('✅ Points balance found:')
      console.log(JSON.stringify(pointsBalance, null, 2))
    } else {
      console.log('❌ No points balance found')
    }
    
    // Test subscription structure
    const subscription = await prisma.subscription.findFirst()
    if (subscription) {
      console.log('✅ Subscription found:')
      console.log(JSON.stringify(subscription, null, 2))
    } else {
      console.log('❌ No subscriptions found')
    }
    
  } catch (error) {
    console.error('❌ Error testing profile:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProfile()
