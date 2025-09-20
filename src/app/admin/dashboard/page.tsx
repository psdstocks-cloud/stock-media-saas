import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminDashboardClient from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

async function getAdminData() {
  try {
    // Get basic metrics
    const [userCount, orderCount, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          cost: true
        },
        where: {
          status: 'COMPLETED'
        }
      })
    ])

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const userGrowth = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true
      }
    })

    return {
      userCount,
      orderCount,
      totalRevenue: totalRevenue._sum.cost || 0,
      recentOrders: recentOrders.map(order => ({
        ...order,
        createdAt: order.createdAt.toISOString()
      })),
      userGrowth: userGrowth.length
    }
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return {
      userCount: 0,
      orderCount: 0,
      totalRevenue: 0,
      recentOrders: [],
      userGrowth: 0
    }
  }
}

export default async function AdminDashboardPage() {
  const session = await auth()

  // Redirect if not authenticated or not admin
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/admin/login')
  }

  const adminData = await getAdminData()

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboardClient initialData={adminData} />
    </div>
  )
}
