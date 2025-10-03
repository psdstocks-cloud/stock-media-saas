'use server'

import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// User roles type
type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

// Security check function - verifies SUPER_ADMIN access
async function verifySuperAdmin() {
    const session = await auth()
  
  if (!session || !(session as any).user) {
    redirect('/admin/login')
  }
  
  if ((session as any).user.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Super admin access required')
  }
  
  return (session as any).user
}

// Update user role
export async function updateUserRole(userId: string, role: UserRole) {
  try {
    await verifySuperAdmin()
    
    // Validate role
    if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return { success: false, error: 'Invalid role specified' }
    }
    
    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true }
    })
    
    // Revalidate the users page
    revalidatePath('/admin/users')
    
    return { 
      success: true, 
      message: `User role updated to ${role}`,
      user: updatedUser
    }
  } catch (error) {
    console.error('Error updating user role:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update user role' 
    }
  }
}

// Delete user
export async function deleteUser(userId: string) {
  try {
    await verifySuperAdmin()
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
    })
    
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    
    // Prevent deletion of other SUPER_ADMIN users
    if (user.role === 'SUPER_ADMIN') {
      return { success: false, error: 'Cannot delete super admin users' }
    }
    
    // Delete user (this will cascade delete related records due to Prisma relations)
    await prisma.user.delete({
      where: { id: userId }
    })
    
    // Revalidate the users page
    revalidatePath('/admin/users')
    
    return { 
      success: true, 
      message: `User ${user.email} has been deleted` 
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete user' 
    }
  }
}

// Suspend/unsuspend user
export async function suspendUser(userId: string, isSuspended: boolean) {
  try {
    await verifySuperAdmin()
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
    })
    
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    
    // Prevent suspension of SUPER_ADMIN users
    if (user.role === 'SUPER_ADMIN') {
      return { success: false, error: 'Cannot suspend super admin users' }
    }
    
    // Update suspension status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        // We'll add isSuspended field to the schema
        // For now, we'll use a custom field or add it to the schema
        lockedUntil: isSuspended ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null // 1 year from now
      },
      select: { id: true, email: true, name: true, role: true, lockedUntil: true }
    })
    
    // Revalidate the users page
    revalidatePath('/admin/users')
    
    return { 
      success: true, 
      message: `User ${isSuspended ? 'suspended' : 'unsuspended'} successfully`,
      user: updatedUser
    }
  } catch (error) {
    console.error('Error suspending user:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to suspend user' 
    }
  }
}

// Get user statistics
export async function getUserStats() {
  try {
    await verifySuperAdmin()
    
    const [
      totalUsers,
      adminUsers,
      suspendedUsers,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.user.count({ where: { lockedUntil: { gt: new Date() } } }),
      prisma.user.count({ 
        where: { 
          createdAt: { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          } 
        } 
      })
    ])
    
    return {
      success: true,
      stats: {
        totalUsers,
        adminUsers,
        suspendedUsers,
        recentUsers,
        regularUsers: totalUsers - adminUsers
      }
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get user statistics' 
    }
  }
}
