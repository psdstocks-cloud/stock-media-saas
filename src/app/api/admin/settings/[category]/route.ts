// src/app/api/admin/settings/[category]/route.ts
// Get and update settings by category

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-log'
import { requirePermission } from '@/lib/rbac'

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'settings.write')
    if (guard) return guard

    const { category } = await params

    const settings = await prisma.adminSetting.findMany({
      where: {
        category,
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { key: 'asc' }
      ]
    })

    // Decrypt sensitive values
    const processedSettings = settings.map(setting => ({
      ...setting,
      value: setting.isEncrypted ? '••••••••' : setting.value
    }))

    return NextResponse.json({ 
      category,
      settings: processedSettings,
      count: settings.length
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'settings.write')
    if (guard) return guard

    const { category } = await params
    const { settings } = await request.json()

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings must be an array' }, { status: 400 })
    }

    const results = []
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown' || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    for (const setting of settings) {
      const { key, value, type } = setting

      if (!key || value === undefined) {
        continue
      }

      // Get current setting for audit log
      const currentSetting = await prisma.adminSetting.findUnique({
        where: { key }
      })

      // Validate setting exists and belongs to category
      if (!currentSetting || currentSetting.category !== category) {
        continue
      }

      // Validate value based on type
      const validationResult = validateSettingValue(value, type, currentSetting.validation || undefined)
      if (!validationResult.valid) {
        return NextResponse.json({ 
          error: `Invalid value for ${key}: ${validationResult.error}` 
        }, { status: 400 })
      }

      // Update setting
      const updatedSetting = await prisma.adminSetting.update({
        where: { key },
        data: {
          value: currentSetting.isEncrypted ? value : value.toString(),
          updatedAt: new Date()
        }
      })

      // Create audit log
      await createAuditLog({
        adminId: session.user.id,
        action: 'UPDATE',
        resourceType: 'setting',
        resourceId: key,
        oldValues: { value: currentSetting.value },
        newValues: { value: updatedSetting.value },
        permission: 'settings.write',
        reason: 'Admin updated category setting',
        permissionSnapshot: { permissions: ['settings.write'] },
        ipAddress: clientIP,
        userAgent
      })

      results.push(updatedSetting)
    }

    return NextResponse.json({ 
      success: true,
      updated: results.length,
      settings: results
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

// Helper function to validate setting values
function validateSettingValue(value: any, type: string, validation?: string): { valid: boolean; error?: string } {
  try {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return { valid: false, error: 'Must be a string' }
        }
        break
      
      case 'number':
        const num = Number(value)
        if (isNaN(num)) {
          return { valid: false, error: 'Must be a valid number' }
        }
        break
      
      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          return { valid: false, error: 'Must be a boolean' }
        }
        break
      
      case 'json':
        try {
          JSON.parse(typeof value === 'string' ? value : JSON.stringify(value))
        } catch {
          return { valid: false, error: 'Must be valid JSON' }
        }
        break
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return { valid: false, error: 'Must be a valid email address' }
        }
        break
      
      case 'url':
        try {
          new URL(value)
        } catch {
          return { valid: false, error: 'Must be a valid URL' }
        }
        break
    }

    // Apply custom validation rules if provided
    if (validation) {
      const rules = JSON.parse(validation)
      
      if (rules.minLength && value.length < rules.minLength) {
        return { valid: false, error: `Minimum length is ${rules.minLength}` }
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        return { valid: false, error: `Maximum length is ${rules.maxLength}` }
      }
      
      if (rules.min && Number(value) < rules.min) {
        return { valid: false, error: `Minimum value is ${rules.min}` }
      }
      
      if (rules.max && Number(value) > rules.max) {
        return { valid: false, error: `Maximum value is ${rules.max}` }
      }
      
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        return { valid: false, error: `Must match pattern: ${rules.pattern}` }
      }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Validation error' }
  }
}
