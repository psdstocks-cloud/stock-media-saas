import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const providedToken = (request.headers.get('x-setup-token') || body.token || '').toString()
    const adminToken = process.env.ADMIN_SETUP_TOKEN || ''

    if (!adminToken || providedToken !== adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = (body.email || '').toLowerCase()
    const password = body.password as string
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 10)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: 'SUPER_ADMIN',
          password: hash,
          emailVerified: new Date(),
          loginAttempts: 0,
          lockedUntil: null,
        },
      })
      return NextResponse.json({ ok: true, updated: true })
    }

    await prisma.user.create({
      data: {
        email,
        role: 'SUPER_ADMIN',
        password: hash,
        emailVerified: new Date(),
      },
    })

    return NextResponse.json({ ok: true, created: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create super admin' }, { status: 500 })
  }
}


