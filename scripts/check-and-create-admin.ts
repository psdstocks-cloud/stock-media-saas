import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkAndCreateAdmin() {
  try {
    console.log('🔍 Checking for admin users...')
    
    // Check if any admin users exist
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    })

    console.log('👥 Found admin users:', adminUsers)

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found. Creating a super admin...')
      
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
        const superAdmin = await prisma.user.create({
          data: {
            email: 'admin@stockmediapro.com',
            name: 'Super Admin',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            emailVerified: new Date()
          }
        })

      console.log('✅ Created super admin:', {
        id: superAdmin.id,
        email: superAdmin.email,
        role: superAdmin.role
      })
      console.log('🔑 Password: admin123')
    } else {
      console.log('✅ Admin users already exist')
      
      // Check if the specific email exists
      const specificAdmin = await prisma.user.findUnique({
        where: { email: 'admin@stockmediapro.com' }
      })
      
      if (!specificAdmin) {
        console.log('❌ admin@stockmediapro.com not found. Creating it...')
        
        const hashedPassword = await bcrypt.hash('admin123', 12)
        
        const newAdmin = await prisma.user.create({
          data: {
            email: 'admin@stockmediapro.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
            emailVerified: new Date()
          }
        })

        console.log('✅ Created admin@stockmediapro.com:', {
          id: newAdmin.id,
          email: newAdmin.email,
          role: newAdmin.role
        })
        console.log('🔑 Password: admin123')
      } else {
        console.log('✅ admin@stockmediapro.com already exists:', {
          id: specificAdmin.id,
          email: specificAdmin.email,
          role: specificAdmin.role,
          hasPassword: !!specificAdmin.password
        })
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateAdmin()
