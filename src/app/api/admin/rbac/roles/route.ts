import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog } from '@/lib/audit-log'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'rbac.manage')
    if (guard) return guard

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')?.trim()

    const skip = (page - 1) * limit
    const where: any = {}
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.role.count({ where }),
    ])

    return NextResponse.json({
      roles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'rbac.manage')
    if (guard) return guard

    const { name, description } = await request.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const role = await prisma.role.create({ data: { name, description } })

    await createAuditLog({
      adminId: session!.user!.id,
      action: 'CREATE',
      resourceType: 'role',
      resourceId: role.id,
      newValues: { name, description },
      permission: 'rbac.manage',
      reason: 'Create role',
    })

    return NextResponse.json({ role }, { status: 201 })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Role name must be unique' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}
