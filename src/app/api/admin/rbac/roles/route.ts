import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

// Simple admin check based on cookies
async function isAdminUser() {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_access_token')
    
    if (!adminToken?.value) {
      return { isAdmin: false, user: null }
    }
    
    // Verify JWT token
    const payload = await verifyToken(adminToken.value)
    
    // Check if user exists and has admin role
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true }
    })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return { isAdmin: false, user: null }
    }
    
    return { isAdmin: true, user }
  } catch (error) {
    console.error('Admin check failed:', error)
    return { isAdmin: false, user: null }
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 RBAC Roles API called')
    
    // Simple admin check first
    const { isAdmin, user } = await isAdminUser()
    if (!isAdmin) {
      console.log('❌ RBAC Roles: Admin access required')
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    console.log('✅ RBAC Roles: Admin authenticated:', user?.email)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search')?.trim()

    const skip = (page - 1) * limit
    const where: any = {}
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    // First, ensure we have some basic roles
    await ensureBasicRoles()

    const [roles, total] = await Promise.all([
      prisma.role.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { name: 'asc' },
        include: {
          permissions: {
            include: {
              permission: true
            }
          },
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.role.count({ where }),
    ])

    console.log('✅ RBAC Roles: Retrieved', roles.length, 'roles')

    return NextResponse.json({
      success: true,
      roles: roles.map(role => ({
        ...role,
        permissionCount: role.permissions.length,
        userCount: role.users.length
      })),
      pagination: { 
        page, 
        limit, 
        total, 
        pages: Math.ceil(total / limit) 
      }
    })
  } catch (error) {
    console.error('❌ RBAC Roles error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch roles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 RBAC Roles POST API called')
    
    const { isAdmin, user } = await isAdminUser()
    if (!isAdmin) {
      console.log('❌ RBAC Roles POST: Admin access required')
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    console.log('✅ RBAC Roles POST: Admin authenticated:', user?.email)

    const { name, description } = await request.json()
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const role = await prisma.role.create({ 
      data: { 
        name: name.trim(), 
        description: description?.trim() || null 
      } 
    })

    console.log('✅ RBAC Roles POST: Created role:', role.name)

    return NextResponse.json({ 
      success: true,
      role 
    }, { status: 201 })
  } catch (error: any) {
    console.error('❌ RBAC Roles POST error:', error)
    
    if (error?.code === 'P2002') {
      return NextResponse.json({ 
        success: false,
        error: 'Role name must be unique' 
      }, { status: 409 })
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create role',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Ensure basic roles exist
async function ensureBasicRoles() {
  try {
    const existingRoles = await prisma.role.count()
    
    if (existingRoles === 0) {
      console.log('🌱 Creating basic roles...')
      
      // Create basic roles
      await prisma.role.createMany({
        data: [
          { name: 'SUPER_ADMIN', description: 'Super administrator with all permissions' },
          { name: 'ADMIN', description: 'Administrator with most permissions' },
          { name: 'SUPPORT', description: 'Support staff with limited permissions' },
          { name: 'USER', description: 'Regular user' },
        ],
        skipDuplicates: true
      })
      
      console.log('✅ Basic roles created successfully')
    }
  } catch (error) {
    console.error('❌ Failed to ensure basic roles:', error)
  }
}