// scripts/make-user-admin.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeUserAdmin() {
  try {
    // Get your email from environment or prompt
    const userEmail = process.env.ADMIN_EMAIL || 'test@example.com' // Using the first test user
    
    console.log(`Looking for user with email: ${userEmail}`)
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })
    
    if (!user) {
      console.error('User not found with email:', userEmail)
      console.log('Available users:')
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true }
      })
      console.table(allUsers)
      return
    }
    
    console.log('Found user:', {
      id: user.id,
      email: user.email,
      name: user.name,
      currentRole: user.role
    })
    
    // Update the user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    })
    
    console.log('✅ User role updated successfully!')
    console.log('Updated user:', {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      newRole: updatedUser.role
    })
    
  } catch (error) {
    console.error('Error updating user role:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeUserAdmin()
