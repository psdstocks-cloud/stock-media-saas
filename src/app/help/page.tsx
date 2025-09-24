export const revalidate = 120

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-2">Help Center</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-8">We’re preparing guides and FAQs. For now, contact support at support@example.com.</p>
      </section>
    </main>
  )
}


