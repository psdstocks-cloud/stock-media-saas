import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminDashboardClient from './AdminDashboardClient'

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AdminDashboardClient />
      </div>
    </ProtectedRoute>
  )
}
