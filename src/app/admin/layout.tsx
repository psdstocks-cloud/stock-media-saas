import AdminSessionProvider from '@/components/providers/admin-session-provider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminSessionProvider>
      {children}
    </AdminSessionProvider>
  )
}
