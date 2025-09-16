// src/app/api/admin/audit-logs/route.ts
// Audit logs management API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth" // <-- Import the new auth helper
import { getAuditLogs, exportAuditLogs } from '@/lib/audit-log'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth() // <-- Use the modern helper

    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const adminId = searchParams.get('adminId')
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resourceType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const filters = {
      adminId: adminId || undefined,
      action: action || undefined,
      resourceType: resourceType || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }

    const result = await getAuditLogs(page, limit, filters)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth() // <-- Use the modern helper

    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { format, filters } = await request.json()

    if (!format || !['csv', 'json'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Must be csv or json' }, { status: 400 })
    }

    const exportData = await exportAuditLogs(format, filters || {})

    return new NextResponse(exportData.content, {
      status: 200,
      headers: {
        'Content-Type': exportData.mimeType,
        'Content-Disposition': `attachment; filename="${exportData.filename}"`
      }
    })
  } catch (error) {
    console.error('Error exporting audit logs:', error)
    return NextResponse.json({ error: 'Failed to export audit logs' }, { status: 500 })
  }
}
