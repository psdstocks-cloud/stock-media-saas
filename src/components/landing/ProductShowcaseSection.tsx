'use client'

import React from 'react'
import DemoVideoModal from '@/components/modals/DemoVideoModal'

export const ProductShowcaseSection: React.FC = () => {
  const [isDemoOpen, setIsDemoOpen] = React.useState(false)
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">See it in action</h2>
          <p className="mt-3 text-gray-600">Paste → Confirm → Download — in seconds.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {["Paste URLs","Confirm Points","Download Fresh Link"].map((title) => (
            <div key={title} className="rounded-2xl border border-[var(--brand-purple-20)] p-4">
              <div className="h-40 rounded-xl bg-[var(--brand-purple-6)]" aria-hidden="true" />
              <h3 className="text-lg font-semibold mt-4 text-[var(--brand-text-hex)]">{title}</h3>
              <p className="text-gray-600 text-sm mt-1">Minimal steps. Clear feedback. It just works.</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button onClick={() => setIsDemoOpen(true)} className="inline-flex items-center px-4 py-2 rounded-md border border-[var(--brand-purple-20)] text-[var(--brand-purple-hex)]" aria-label="Watch quick demo">
            Watch demo
          </button>
        </div>
        <DemoVideoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      </div>
    </section>
  )
}

export default ProductShowcaseSection


