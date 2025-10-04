import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

async function isAdminUser() {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_access_token')
    
    if (!adminToken?.value) {
      return false
    }
    
    // Verify JWT token
    const payload = await verifyToken(adminToken.value)
    
    // Check if user exists and has admin role
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true }
    })
    
    return !!(user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'))
  } catch (error) {
    console.error('Admin check failed:', error)
    return false
  }
}

const DEFAULT_PERMISSIONS = [
  // User permissions
  'users.view',
  'users.edit',
  'users.delete',
  'users.impersonate',
  
  // Order permissions
  'orders.view',
  'orders.manage',
  'orders.refund',
  
  // Point permissions
  'points.view',
  'points.adjust',
  
  // Billing permissions
  'billing.view',
  'billing.manage',
  
  // RBAC permissions
  'rbac.manage',
  'rbac.view',
  
  // Settings permissions
  'settings.read',
  'settings.write',
  
  // Feature flag permissions
  'flags.view',
  'flags.manage',
  
  // Approval permissions
  'approvals.manage',
  'approvals.view',
  
  // Audit permissions
  'audit.view'
]

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 RBAC Permissions API called')
    
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      console.log('❌ RBAC Permissions: Admin access required')
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    console.log('✅ RBAC Permissions: Admin authenticated')

    // First ensure basic permissions exist
    await ensureBasicPermissions()

    const permissions = await prisma.permission.findMany({
      orderBy: { key: 'asc' }
    })

    console.log('✅ RBAC Permissions: Retrieved', permissions.length, 'permissions')

    return NextResponse.json({
      success: true,
      permissions: permissions.map(p => p.key),
      allPermissions: permissions
    })
  } catch (error) {
    console.error('❌ RBAC Permissions error:', error)
    
    // Fallback to default permissions
    console.log('🔄 RBAC Permissions: Using fallback permissions')
    return NextResponse.json({
      success: true,
      permissions: DEFAULT_PERMISSIONS,
      fallback: true
    })
  }
}

async function ensureBasicPermissions() {
  try {
    const existingCount = await prisma.permission.count()
    
    if (existingCount === 0) {
      console.log('🌱 Creating basic permissions...')
      
      await prisma.permission.createMany({
        data: DEFAULT_PERMISSIONS.map(key => ({
          key,
          description: `Permission for ${key.replace('.', ' ')}`
        })),
        skipDuplicates: true
      })
      
      console.log('✅ Basic permissions created successfully')
    }
  } catch (error) {
    console.error('❌ Failed to ensure basic permissions:', error)
  }
}