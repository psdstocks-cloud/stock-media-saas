const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Generate secure password
    const password = 'Admin123!@#'
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@stockmediasaas.com',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        emailVerified: new Date(),
        onboardingCompleted: true,
        onboardingCompletedAt: new Date()
      }
    })
    
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@stockmediasaas.com')
    console.log('🔑 Password: Admin123!@#')
    console.log('👤 Role: SUPER_ADMIN')
    console.log('🆔 User ID:', admin.id)
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Admin user already exists!')
      console.log('📧 Email: admin@stockmediasaas.com')
      console.log('🔑 Password: Admin123!@#')
    } else {
      console.error('❌ Error creating admin user:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
