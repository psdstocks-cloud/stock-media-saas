import TicketsManagementClient from './TicketsManagementClient'

export const dynamic = 'force-dynamic'

export default function AdminTicketsPage() {
  return (
    <div className="min-h-screen bg-background">
      <TicketsManagementClient />
    </div>
  )
}