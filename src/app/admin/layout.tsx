import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import AdminLayout from './AdminLayout'
import ConditionalAdminWrapper from './ConditionalAdminWrapper'

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConditionalAdminWrapper>
      {children}
    </ConditionalAdminWrapper>
  )
}
