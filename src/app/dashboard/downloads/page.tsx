import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import DownloadsClient from './DownloadsClient'

export const dynamic = 'force-dynamic'

interface OrderWithDetails {
  id: string
  title: string | null
  imageUrl: string | null
  cost: number
  status: string
  downloadUrl: string | null
  fileName: string | null
  fileSize: number | null
  createdAt: Date
  updatedAt: Date
  stockSite: {
    id: string
    name: string
    displayName: string
  }
}

export default async function DownloadsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  try {
    // Fetch user's orders with related data
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: {
          in: ['COMPLETED', 'PROCESSING', 'FAILED']
        }
      },
      include: {
        stockSite: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to recent 50 orders for performance
    })

    // Transform the data for the client component
    const ordersWithDetails: OrderWithDetails[] = orders.map(order => ({
      id: order.id,
      title: order.title,
      imageUrl: order.imageUrl,
      cost: order.cost,
      status: order.status,
      downloadUrl: order.downloadUrl,
      fileName: order.fileName,
      fileSize: order.fileSize,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      stockSite: order.stockSite
    }))

    // Get user's points balance for display
    const pointsBalance = await prisma.pointsBalance.findUnique({
      where: { userId: session.user.id },
      select: {
        currentPoints: true,
        totalUsed: true
      }
    })

    // Get download statistics
    const stats = await prisma.order.aggregate({
      where: {
        userId: session.user.id,
        status: 'COMPLETED'
      },
      _count: {
        id: true
      },
      _sum: {
        cost: true
      }
    })

    const totalDownloads = stats._count.id || 0
    const totalPointsSpent = stats._sum.cost || 0

    return (
      <DownloadsClient 
        user={session.user}
        initialOrders={ordersWithDetails}
        pointsBalance={pointsBalance}
        stats={{
          totalDownloads,
          totalPointsSpent,
          currentPoints: pointsBalance?.currentPoints || 0
        }}
      />
    )
  } catch (error) {
    console.error('Error fetching downloads data:', error)
    
    // Return empty state on error
    return (
      <DownloadsClient 
        user={session.user}
        initialOrders={[]}
        pointsBalance={null}
        stats={{
          totalDownloads: 0,
          totalPointsSpent: 0,
          currentPoints: 0
        }}
        error="Failed to load download history. Please try again later."
      />
    )
  }
}
