import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createDemoUser() {
  try {
    // Check if demo user already exists
    const existingDemo = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })

    if (existingDemo) {
      console.log('Demo user already exists:', {
        id: existingDemo.id,
        email: existingDemo.email,
        role: existingDemo.role
      })
      
      // Update password to make sure it's correct
      const hashedPassword = await bcrypt.hash('demo123', 12)
      await prisma.user.update({
        where: { id: existingDemo.id },
        data: { password: hashedPassword }
      })
      console.log('✅ Demo user password updated!')
      return
    }

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 12)
    
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
        onboardingCompleted: true,
        onboardingCompletedAt: new Date()
      }
    })

    console.log('Demo user created successfully:', {
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role
    })

  } catch (error) {
    console.error('Error creating demo user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoUser()
