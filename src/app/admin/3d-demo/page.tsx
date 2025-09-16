import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import ThreeDDemoClient from './ThreeDDemoClient'

export default async function ThreeDDemo() {
  const session = await auth()
  
  console.log('3D Demo page - Session check:', { 
    hasSession: !!session, 
    userId: session?.user?.id, 
    userRole: session?.user?.role 
  })
  
  if (!session?.user?.id) {
    console.log('3D Demo page - No session, redirecting to admin login')
    redirect('/admin/login')
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  console.log('3D Demo page - User role check:', { 
    userId: session.user.id, 
    userRole: user?.role, 
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' 
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    console.log('3D Demo page - Not admin, redirecting to dashboard')
    redirect('/dashboard')
  }

  return (
    <AdminLayout>
      <ThreeDDemoClient />
    </AdminLayout>
  )
}
