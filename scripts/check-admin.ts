import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    console.log('🔍 Existing Admin Accounts:')
    console.log('========================')
    
    if (admins.length === 0) {
      console.log('No admin accounts found.')
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Email: ${admin.email}`)
        console.log(`   Name: ${admin.name}`)
        console.log(`   ID: ${admin.id}`)
        console.log(`   Created: ${admin.createdAt.toISOString()}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('Error checking admin accounts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmins()
