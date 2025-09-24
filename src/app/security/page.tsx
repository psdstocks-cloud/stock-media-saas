export const revalidate = 86400

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-2">Security</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-8">We take security seriously. This page summarizes our data handling and practices.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="font-semibold mb-2">Data</h2>
            <p className="text-[hsl(var(--muted-foreground))]">Encrypted in transit; minimal retention.</p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="font-semibold mb-2">Authentication</h2>
            <p className="text-[hsl(var(--muted-foreground))]">JWT-based sessions and secure password flows.</p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="font-semibold mb-2">Payments</h2>
            <p className="text-[hsl(var(--muted-foreground))]">Processed by Stripe; we don’t store card data.</p>
          </div>
        </div>
      </section>
    </main>
  )
}


