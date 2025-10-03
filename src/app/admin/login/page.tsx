import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import AdminLoginPage from './AdminLoginPage'

export default function AdminLoginPageWrapper() {
  return (
    <AdminAuthProvider>
      <AdminLoginPage />
    </AdminAuthProvider>
  )
}
