// Test admin authentication configuration
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAdminAuth() {
  try {
    console.log('🔍 Testing admin authentication...')
    
    // Check environment variables
    console.log('\n📋 Environment Variables:')
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing')
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing')
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? '✅ Set' : '❌ Missing')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing')
    
    // Check admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'psdstockss@gmail.com' },
      select: { id: true, email: true, role: true, name: true }
    })
    
    console.log('\n👤 Admin User Check:')
    if (adminUser) {
      console.log('✅ User found:', adminUser.email, `(${adminUser.role})`)
    } else {
      console.log('❌ User not found')
    }
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('\n🗄️ Database: ✅ Connected')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminAuth()
