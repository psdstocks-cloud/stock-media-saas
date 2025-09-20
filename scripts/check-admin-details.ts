import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkAdminDetails() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@stockmedia.com' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        loginAttempts: true,
        lockedUntil: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    if (!admin) {
      console.log('❌ Admin account not found!')
      return
    }

    console.log('🔍 Admin Account Details:')
    console.log('========================')
    console.log(`ID: ${admin.id}`)
    console.log(`Email: ${admin.email}`)
    console.log(`Name: ${admin.name}`)
    console.log(`Role: ${admin.role}`)
    console.log(`Login Attempts: ${admin.loginAttempts}`)
    console.log(`Locked Until: ${admin.lockedUntil}`)
    console.log(`Last Login: ${admin.lastLoginAt}`)
    console.log(`Created: ${admin.createdAt}`)
    console.log(`Has Password: ${admin.password ? 'Yes' : 'No'}`)

    if (admin.password) {
      // Test password verification
      const testPassword = 'admin123'
      const isValid = await bcrypt.compare(testPassword, admin.password)
      console.log(`Password '${testPassword}' is valid: ${isValid}`)
      
      // If password is invalid, let's update it
      if (!isValid) {
        console.log('\n🔄 Updating admin password...')
        const newHashedPassword = await bcrypt.hash('admin123', 12)
        await prisma.user.update({
          where: { id: admin.id },
          data: { password: newHashedPassword }
        })
        console.log('✅ Admin password updated successfully!')
      }
    } else {
      console.log('\n🔄 Creating admin password...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      })
      console.log('✅ Admin password created successfully!')
    }

  } catch (error) {
    console.error('Error checking admin details:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminDetails()
