import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      take: 3,
      include: { stockSite: true }
    })

    const debugData = orders.map(order => ({
      id: order.id,
      stockItemId: order.stockItemId,
      stockItemUrl: order.stockItemUrl,
      imageUrl: order.imageUrl,
      title: order.title,
      site: order.stockSite.name,
      status: order.status
    }))

    return NextResponse.json({ orders: debugData })
  } catch (error) {
    console.error('Error fetching debug orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
