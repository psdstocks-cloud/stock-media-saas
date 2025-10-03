import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import AdminLayout from './AdminLayout'

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AdminAuthProvider>
  )
}
