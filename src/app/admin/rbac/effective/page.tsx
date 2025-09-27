import EffectiveClient from './EffectiveClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Effective Permissions • Admin',
  description: 'Inspect user roles and effective permissions',
}

export default function EffectivePermissionsPage() {
  return <EffectiveClient />
}
