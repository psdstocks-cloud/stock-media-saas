import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    console.log('🔍 Finding admin@stockmediapro.com...')
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@stockmediapro.com' }
    })

    if (!admin) {
      console.log('❌ Admin user not found')
      return
    }

    console.log('👤 Found admin user:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      hasPassword: !!admin.password
    })

    // Reset password to a known value
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        emailVerified: new Date()
      }
    })

    console.log('✅ Password reset successful!')
    console.log('🔑 New password:', newPassword)
    console.log('📧 Email: admin@stockmediapro.com')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()
