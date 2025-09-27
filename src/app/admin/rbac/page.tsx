import RolesClient from './roles/RolesClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'RBAC Roles • Admin',
  description: 'Manage roles, permissions, and assignments',
}

export default function RBACPage() {
  return <RolesClient />
}
