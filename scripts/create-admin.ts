import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      console.log('Admin account already exists:', {
        id: existingAdmin.id,
        email: existingAdmin.email,
        role: existingAdmin.role
      })
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@stockmedia.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date(),
        onboardingCompleted: true,
        onboardingCompletedAt: new Date()
      }
    })

    console.log('Admin account created successfully:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    })

    console.log('\n🔑 Admin Login Credentials:')
    console.log('Email: admin@stockmedia.com')
    console.log('Password: admin123')
    console.log('\n📝 Note: Please change the password after first login for security.')

  } catch (error) {
    console.error('Error creating admin account:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
