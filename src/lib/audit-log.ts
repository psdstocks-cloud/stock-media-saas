// src/lib/audit-log.ts
// Audit logging utility for admin actions

import { prisma } from '@/lib/prisma'

interface CreateAuditLogParams {
  adminId: string
  action: string
  resourceType?: string
  resourceId?: string
  oldValues?: any
  newValues?: any
  permission?: string
  reason?: string
  permissionSnapshot?: any
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    const {
      adminId,
      action,
      resourceType,
      resourceId,
      oldValues,
      newValues,
      permission,
      reason,
      permissionSnapshot,
      ipAddress,
      userAgent
    } = params

    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        resourceType,
        resourceId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        permission,
        reason,
        permissionSnapshot: permissionSnapshot ? JSON.stringify(permissionSnapshot) : null,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
    // Don't throw error to avoid breaking the main operation
  }
}

export async function getAuditLogs(
  page: number = 1,
  limit: number = 50,
  filters: {
    adminId?: string
    action?: string
    resourceType?: string
    startDate?: string
    endDate?: string
  } = {}
) {
  try {
    const skip = (page - 1) * limit
    const where: any = {}

    if (filters.adminId) where.adminId = filters.adminId
    if (filters.action) where.action = filters.action
    if (filters.resourceType) where.resourceType = filters.resourceType
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate)
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate)
    }

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.adminAuditLog.count({ where })
    ])

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    throw error
  }
}

export async function exportAuditLogs(
  format: 'csv' | 'json' = 'json',
  filters: {
    adminId?: string
    action?: string
    resourceType?: string
    startDate?: string
    endDate?: string
  } = {}
) {
  try {
    const { logs } = await getAuditLogs(1, 10000, filters) // Get all logs

    if (format === 'csv') {
      const headers = [
        'ID',
        'Admin',
        'Action',
        'Resource Type',
        'Resource ID',
        'Old Values',
        'New Values',
        'IP Address',
        'User Agent',
        'Created At'
      ]

      const rows = logs.map(log => [
        log.id,
        log.admin.email,
        log.action,
        log.resourceType || '',
        log.resourceId || '',
        log.oldValues || '',
        log.newValues || '',
        log.ipAddress || '',
        log.userAgent || '',
        log.createdAt.toISOString()
      ])

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      return {
        content: csvContent,
        mimeType: 'text/csv',
        filename: `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      }
    } else {
      return {
        content: JSON.stringify(logs, null, 2),
        mimeType: 'application/json',
        filename: `audit-logs-${new Date().toISOString().split('T')[0]}.json`
      }
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error)
    throw error
  }
}
