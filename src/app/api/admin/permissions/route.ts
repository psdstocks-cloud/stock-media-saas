// src/app/api/admin/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getEffectivePermissions } from '@/lib/rbac'
import { getUserFromRequest } from '@/lib/jwt-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const permissions = await getEffectivePermissions(user.id)
    return NextResponse.json({ permissions: Array.from(permissions) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
  }
}
