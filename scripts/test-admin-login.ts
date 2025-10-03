import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login process...')
    
    const email = 'admin@stockmediapro.com'
    const password = 'admin123'
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    console.log('👤 User found:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      emailVerified: user.emailVerified
    } : 'Not found')
    
    if (!user || !user.password) {
      console.log('❌ User not found or no password')
      return
    }
    
    // Check role
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ User is not admin:', user.role)
      return
    }
    
    console.log('✅ User has admin role:', user.role)
    
    // Test password
    const isValid = await bcrypt.compare(password, user.password)
    console.log('🔐 Password valid:', isValid)
    
    if (isValid) {
      console.log('✅ Login would succeed!')
    } else {
      console.log('❌ Password verification failed')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminLogin()