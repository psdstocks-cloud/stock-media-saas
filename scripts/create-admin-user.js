const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...')
    
    const email = 'admin@test.com'
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      },
      create: {
        email,
        name: 'Test Admin',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Admin user created/updated successfully:')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`👤 Role: ${admin.role}`)
    console.log(`🆔 ID: ${admin.id}`)
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
