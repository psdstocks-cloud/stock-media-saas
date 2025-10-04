const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🚀 Creating admin user...')
    
    const email = 'admin@test.com'
    const password = 'admin123456' // Stronger password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Delete existing admin if exists
    await prisma.user.deleteMany({
      where: { email }
    })
    
    // Create new admin
    const admin = await prisma.user.create({
      data: {
        email,
        name: 'Test Admin',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Admin user created successfully!')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`👤 Role: ${admin.role}`)
    console.log(`🆔 ID: ${admin.id}`)
    console.log('\n🔗 Login at: https://stock-media-saas.vercel.app/admin/login')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()