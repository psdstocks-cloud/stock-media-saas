import { SUPPORTED_SITES } from '@/lib/supported-sites'

export const revalidate = 300

export default function SupportedPlatformsPage() {
  const categories = Array.from(new Set(SUPPORTED_SITES.map(s => s.category)))
  return (
    <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-2">Supported Platforms</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-8">A quick reference list of sites we support. Full docs coming soon.</p>

        <div className="space-y-10">
          {categories.map(cat => (
            <div key={cat}>
              <h2 className="text-2xl font-semibold capitalize mb-4">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {SUPPORTED_SITES.filter(s => s.category === cat).map(site => (
                  <div key={site.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-4">
                    <div className="font-medium">{site.displayName}</div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">{site.website}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}


