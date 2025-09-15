// src/app/api/admin/settings/categories/route.ts
// Get all settings categories with metadata

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth-admin"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get categories with counts and metadata
    const categories = await prisma.adminSetting.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      where: {
        isActive: true
      }
    })

    // Define category metadata
    const categoryMetadata = {
      general: {
        name: 'General Settings',
        description: 'Basic platform configuration and branding',
        icon: 'Settings',
        color: 'blue',
        order: 1
      },
      security: {
        name: 'Security & Authentication',
        description: 'Security policies, authentication, and access control',
        icon: 'Shield',
        color: 'red',
        order: 2
      },
      payment: {
        name: 'Payment & Billing',
        description: 'Stripe configuration, pricing, and billing settings',
        icon: 'CreditCard',
        color: 'green',
        order: 3
      },
      email: {
        name: 'Email & Notifications',
        description: 'SMTP configuration, email templates, and notifications',
        icon: 'Mail',
        color: 'purple',
        order: 4
      },
      api: {
        name: 'API & Integrations',
        description: 'External API keys, webhooks, and third-party integrations',
        icon: 'Webhook',
        color: 'orange',
        order: 5
      },
      analytics: {
        name: 'Analytics & Reporting',
        description: 'Analytics configuration, reporting, and metrics',
        icon: 'BarChart3',
        color: 'indigo',
        order: 6
      },
      system: {
        name: 'System & Performance',
        description: 'System health, performance monitoring, and maintenance',
        icon: 'Activity',
        color: 'gray',
        order: 7
      },
      features: {
        name: 'Feature Management',
        description: 'Feature flags, A/B testing, and gradual rollouts',
        icon: 'ToggleLeft',
        color: 'pink',
        order: 8
      }
    }

    const result = categories.map(cat => ({
      key: cat.category,
      count: cat._count.category,
      ...categoryMetadata[cat.category as keyof typeof categoryMetadata]
    })).sort((a, b) => a.order - b.order)

    return NextResponse.json({ categories: result })
  } catch (error) {
    console.error('Error fetching settings categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
