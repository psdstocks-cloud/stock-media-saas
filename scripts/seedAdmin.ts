import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin user seeding...')
    
    const adminEmail = 'psdstockss@gmail.com'
    
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true, email: true, role: true }
    })
    
    if (existingUser) {
      console.log('✅ Admin user already exists:', {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role
      })
      
      // Update role to SUPER_ADMIN if not already
      if (existingUser.role !== 'SUPER_ADMIN') {
        const updatedUser = await prisma.user.update({
          where: { email: adminEmail },
          data: { role: 'SUPER_ADMIN' },
          select: { id: true, email: true, role: true }
        })
        
        console.log('🔄 Updated user role to SUPER_ADMIN:', updatedUser)
      }
      
      return
    }
    
    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        role: 'SUPER_ADMIN',
        emailVerified: new Date(), // Mark as verified
        createdAt: new Date(),
        updatedAt: new Date()
      },
      select: { id: true, email: true, role: true, name: true }
    })
    
    console.log('✅ Admin user created successfully:', adminUser)
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedAdmin()
  .then(() => {
    console.log('🎉 Admin seeding completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Admin seeding failed:', error)
    process.exit(1)
  })
