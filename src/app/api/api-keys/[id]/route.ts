export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isActive } = await request.json()

    const apiKey = await prisma.apiKey.updateMany({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      data: { isActive },
    })

    if (apiKey.count === 0) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = await prisma.apiKey.deleteMany({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
    })

    if (apiKey.count === 0) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
