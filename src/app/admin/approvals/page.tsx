import AdminApprovalsClient from './AdminApprovalsClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Approvals • Stock Media SaaS',
  description: 'Review and approve high-risk requests',
}

export default function AdminApprovalsPage() {
  return <AdminApprovalsClient />
}
