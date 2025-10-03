import AdminDashboardClient from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminDashboardClient />
    </div>
  )
}
