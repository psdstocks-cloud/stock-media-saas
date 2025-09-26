import AdminSettingsClient from './AdminSettingsClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Settings • Stock Media SaaS',
  description: 'Manage system settings',
}

export default function AdminSettingsPage() {
  return <AdminSettingsClient />
}
