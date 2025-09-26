// src/app/api/admin/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getEffectivePermissions } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const permissions = await getEffectivePermissions(session.user.id)
    return NextResponse.json({ permissions: Array.from(permissions) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
  }
}
