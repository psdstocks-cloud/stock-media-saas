import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get webhook configuration from system settings
    const webhookConfig = await prisma.systemSetting.findFirst({
      where: { key: 'webhook_config' }
    })

    const config = webhookConfig ? JSON.parse(webhookConfig.value) : {
      url: 'https://webhook.site/',
      downloadStatusEnabled: false,
      accountStatusEnabled: false,
      telegramEnabled: false
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching webhook config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const config = await request.json()

    // Validate configuration
    if (!config.url || typeof config.url !== 'string') {
      return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 })
    }

    // Save webhook configuration to system settings
    await prisma.systemSetting.upsert({
      where: { key: 'webhook_config' },
      update: {
        value: JSON.stringify(config),
        updatedAt: new Date()
      },
      create: {
        key: 'webhook_config',
        value: JSON.stringify(config),
        description: 'Nehtw.com webhook configuration'
      }
    })

    return NextResponse.json({ success: true, message: 'Webhook configuration saved' })
  } catch (error) {
    console.error('Error saving webhook config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
