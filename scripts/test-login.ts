import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('🧪 Testing Login Process...')
    console.log('============================')

    // Test admin login
    console.log('\n1. Testing Admin Login:')
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@stockmedia.com' },
      select: {
        id: true,
        email: true,
        password: true,
        role: true
      }
    })

    if (admin) {
      console.log(`✅ Admin found: ${admin.email}`)
      console.log(`✅ Role: ${admin.role}`)
      console.log(`✅ Has password: ${admin.password ? 'Yes' : 'No'}`)
      
      if (admin.password) {
        const isValid = await bcrypt.compare('admin123', admin.password)
        console.log(`✅ Password 'admin123' is valid: ${isValid}`)
      }
    } else {
      console.log('❌ Admin not found!')
    }

    // Test demo login
    console.log('\n2. Testing Demo Login:')
    const demo = await prisma.user.findUnique({
      where: { email: 'demo@example.com' },
      select: {
        id: true,
        email: true,
        password: true,
        role: true
      }
    })

    if (demo) {
      console.log(`✅ Demo user found: ${demo.email}`)
      console.log(`✅ Role: ${demo.role}`)
      console.log(`✅ Has password: ${demo.password ? 'Yes' : 'No'}`)
      
      if (demo.password) {
        const isValid = await bcrypt.compare('demo123', demo.password)
        console.log(`✅ Password 'demo123' is valid: ${isValid}`)
      }
    } else {
      console.log('❌ Demo user not found!')
    }

    // Test database connection
    console.log('\n3. Testing Database Connection:')
    const userCount = await prisma.user.count()
    console.log(`✅ Database connected. Total users: ${userCount}`)

  } catch (error) {
    console.error('❌ Error testing login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
