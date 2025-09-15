import { prisma } from '@/lib/prisma'
import { UsersTable } from './users-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, UserX, UserPlus } from 'lucide-react'
import { UserWithStatus } from '@/lib/types' // <-- IMPORT the shared type

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  // Fetch all users from the database
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      lockedUntil: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Transform users to include computed fields
  const usersWithStatus: UserWithStatus[] = users.map(user => ({
    ...user,
    isSuspended: user.lockedUntil ? new Date() < user.lockedUntil : false
  }))

  // Get user statistics
  const totalUsers = users.length
  const adminUsers = users.filter(user => user.role === 'ADMIN' || user.role === 'SUPER_ADMIN').length
  const suspendedUsers = usersWithStatus.filter(user => user.isSuspended).length
  const regularUsers = totalUsers - adminUsers

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage all users in the system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">
              ADMIN and SUPER_ADMIN roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularUsers}</div>
            <p className="text-xs text-muted-foreground">
              Standard USER role
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspendedUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently suspended users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage all users in the system. Use the search bar to filter by email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable users={usersWithStatus} />
        </CardContent>
      </Card>
    </div>
  )
}
