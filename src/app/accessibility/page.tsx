export const revalidate = 86400

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-2">Accessibility Statement</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-6">We aim to meet WCAG 2.2 AA. If you encounter barriers, email a11y@example.com.</p>
        <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--muted-foreground))]">
          <li>Keyboard accessible navigation and focus management</li>
          <li>High‑contrast light and dark themes</li>
          <li>ARIA live regions for status updates</li>
        </ul>
      </section>
    </main>
  )
}


