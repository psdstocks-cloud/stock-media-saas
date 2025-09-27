// src/app/api/admin/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getEffectivePermissions } from '@/lib/rbac'
import { getUserFromRequest } from '@/lib/jwt-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (process.env.NEXT_PUBLIC_E2E) {
      const role = (user as any).role || 'USER'
      let list: string[] = []
      if (role === 'SUPER_ADMIN') {
        list = [
          'users.view','users.edit','users.impersonate',
          'orders.view','orders.manage','orders.refund',
          'points.adjust','billing.view',
          'flags.view','flags.manage','settings.write','approvals.manage'
        ]
      } else if (role === 'ADMIN') {
        list = ['orders.view','orders.manage','approvals.manage','users.view']
      }
      return NextResponse.json({ permissions: list })
    }
    const permissions = await getEffectivePermissions(user.id)
    return NextResponse.json({ permissions: Array.from(permissions) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
  }
}
