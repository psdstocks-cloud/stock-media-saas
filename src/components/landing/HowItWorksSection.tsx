'use client'

import React from 'react'

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      k: '1',
      title: 'Paste URL',
      desc: 'Paste a stock media link from any supported platform.',
    },
    {
      k: '2',
      title: 'Confirm & Process',
      desc: 'We validate the link, show points, and start processing.',
    },
    {
      k: '3',
      title: 'Download',
      desc: 'Get a fresh download link, every time.',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How it works</h2>
          <p className="mt-3 text-gray-600">It just works — three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {steps.map((s) => (
            <div key={s.k} className="p-6 rounded-xl border border-[var(--brand-purple-20)] bg-white transition-colors">
              <div className="text-sm text-[var(--brand-muted-hex)] mb-2">Step {s.k}</div>
              <h3 className="text-xl font-semibold mb-2 text-[var(--brand-text-hex)]">{s.title}</h3>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection


