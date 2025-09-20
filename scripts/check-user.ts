import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@stockmedia.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    if (user) {
      console.log('🔍 User found with admin@stockmedia.com:')
      console.log('=====================================')
      console.log(`Email: ${user.email}`)
      console.log(`Name: ${user.name}`)
      console.log(`Role: ${user.role}`)
      console.log(`ID: ${user.id}`)
      console.log(`Created: ${user.createdAt.toISOString()}`)
      
      if (user.role !== 'admin') {
        console.log('\n🔄 Updating user role to admin...')
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin' }
        })
        console.log('✅ User role updated to admin!')
      }
    } else {
      console.log('❌ No user found with admin@stockmedia.com')
    }

  } catch (error) {
    console.error('Error checking user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
