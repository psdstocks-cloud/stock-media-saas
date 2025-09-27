import { Metadata } from 'next'
import ApprovalsClient from './ApprovalsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Approvals • Dashboard',
  description: 'Track your approval requests',
}

export default function MyApprovalsPage() {
  return <ApprovalsClient />
}
