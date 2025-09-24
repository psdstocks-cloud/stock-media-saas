export const revalidate = 60

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-2">System Status</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-8">All systems operational. Incident history and live metrics coming soon.</p>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-6">
          <div className="flex items-center justify-between">
            <span>API</span>
            <span className="text-green-500">Operational</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Website</span>
            <span className="text-green-500">Operational</span>
          </div>
        </div>
      </section>
    </main>
  )
}


