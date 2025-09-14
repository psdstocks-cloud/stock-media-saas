// scripts/setup-admin-password.ts
// Set up secure admin password

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setupAdminPassword() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@stockmedia.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecure2024!'
    
    console.log(`Setting up admin password for: ${adminEmail}`)
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    // Find or create admin user
    let admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (!admin) {
      // Create new admin user
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin User',
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      })
      console.log('✅ Admin user created successfully!')
    } else {
      // Update existing user
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          loginAttempts: 0,
          lockedUntil: null
        }
      })
      console.log('✅ Admin password updated successfully!')
    }
    
    console.log('Admin credentials:')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log(`Role: ${admin.role}`)
    console.log('\n🔐 Keep these credentials secure!')
    
  } catch (error) {
    console.error('Error setting up admin password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdminPassword()
