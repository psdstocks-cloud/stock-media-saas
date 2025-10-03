import OrderManagementClient from './OrderManagementClient'

export const dynamic = 'force-dynamic'

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <OrderManagementClient />
    </div>
  )
}
