import AuditLogsClient from './AuditLogsClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Audit Logs • Admin',
  description: 'Read-only audit logs with export',
}

export default function AuditLogsPage() {
  return <AuditLogsClient />
}
