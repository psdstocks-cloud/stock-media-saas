import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminWithParams() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2)
    
    if (args.length < 3) {
      console.log('Usage: npx tsx scripts/create-admin-with-params.ts "Admin Name" "admin@example.com" "YourStrongPassword123"')
      return
    }

    const [name, email, password] = args

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', email)
      return
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      console.log('👤 User with this email already exists:', {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role
      })
      
      if (existingUser.role === 'admin' || existingUser.role === 'SUPER_ADMIN') {
        console.log('✅ This user is already an admin')
        return
      } else {
        console.log('🔄 Updating user role to admin...')
        
        // Update existing user to admin
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: 'SUPER_ADMIN',
            name: name,
            password: await bcrypt.hash(password, 12),
            emailVerified: new Date(),
            onboardingCompleted: true,
            onboardingCompletedAt: new Date(),
            updatedAt: new Date()
          }
        })

        console.log('✅ User updated to admin successfully:', {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role
        })

        console.log('\n🔑 Admin Login Credentials:')
        console.log(`Email: ${email}`)
        console.log(`Password: ${password}`)
        console.log('\n📝 Note: Please change the password after first login for security.')
        return
      }
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const admin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        emailVerified: new Date(),
        onboardingCompleted: true,
        onboardingCompletedAt: new Date()
      }
    })

    console.log('✅ Admin account created successfully:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    })

    console.log('\n🔑 Admin Login Credentials:')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('\n📝 Note: Please change the password after first login for security.')

  } catch (error) {
    console.error('❌ Error creating admin account:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminWithParams()
