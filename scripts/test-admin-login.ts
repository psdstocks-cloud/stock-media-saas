import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function testAdminLogin() {
  try {
    console.log('Testing admin login...')
    
    // Find the admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@stockmedia.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    })

    if (!user) {
      console.log('❌ Admin user not found')
      return
    }

    console.log('✅ Admin user found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password
    })

    // Test password
    const testPassword = 'AdminSecure2024!'
    const isValidPassword = user.password ? await bcrypt.compare(testPassword, user.password) : false

    console.log('Password test:', {
      testPassword,
      isValidPassword
    })

    if (isValidPassword) {
      console.log('✅ Password is correct')
    } else {
      console.log('❌ Password is incorrect')
      
      // Try to update the password
      console.log('Updating password...')
      const hashedPassword = await bcrypt.hash(testPassword, 12)
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Password updated successfully')
    }

  } catch (error) {
    console.error('Error testing admin login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminLogin()
