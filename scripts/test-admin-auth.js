const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAdminAuth() {
  try {
    console.log('🔍 Testing admin authentication...')
    
    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'SUPER_ADMIN' }
        ]
      }
    })

    if (!adminUser) {
      console.log('❌ No admin user found!')
      return
    }

    console.log('✅ Admin user found:')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Name: ${adminUser.name}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   Active: ${adminUser.isActive}`)
    console.log(`   Created: ${adminUser.createdAt}`)

    // Test password verification
    if (adminUser.password) {
      const testPassword = 'admin123' // Default password from our script
      const passwordMatch = await bcrypt.compare(testPassword, adminUser.password)
      console.log(`   Password verification: ${passwordMatch ? '✅ Valid' : '❌ Invalid'}`)
    } else {
      console.log('   Password: ❌ No password set')
    }

    console.log('\n🎯 Authentication test completed!')
    console.log('You can now test login at: http://localhost:3000/admin/auth/signin')
    console.log(`Use email: ${adminUser.email}`)
    console.log('Use password: admin123')

  } catch (error) {
    console.error('❌ Error testing admin auth:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminAuth()
