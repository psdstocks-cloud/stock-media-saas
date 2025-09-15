// src/app/(admin)/page.tsx
export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome to the main dashboard.</p>
    </div>
  );
}