const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestAdmin() {
  try {
    console.log('🔧 Creating test admin user...')
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'SUPER_ADMIN' }
        ]
      }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:')
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Role: ${existingAdmin.role}`)
      console.log(`   ID: ${existingAdmin.id}`)
      return
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@stockmediapro.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        emailVerified: new Date(),
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      }
    })

    console.log('✅ Test admin user created successfully!')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Password: admin123`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   ID: ${admin.id}`)
    
    console.log('\n🎯 You can now test the authentication system:')
    console.log('   1. Visit: http://localhost:3000/admin/login')
    console.log('   2. Use email: admin@stockmediapro.com')
    console.log('   3. Use password: admin123')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestAdmin()
