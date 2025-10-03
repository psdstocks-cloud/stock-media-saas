import UserManagementClient from './UserManagementClient'

export const dynamic = 'force-dynamic'

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-background">
      <UserManagementClient />
    </div>
  )
}
