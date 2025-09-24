'use client'

import React from 'react'

const faqs = [
  { q: 'How are points used?', a: 'Most assets cost 10 points. We always generate a fresh link.' },
  { q: 'Which sites are supported?', a: '50+ providers. See Supported Platforms for examples and patterns.' },
  { q: 'Can I re-download for free?', a: 'Yes. Completed items can be re-downloaded without deducting points.' },
  { q: 'Is my data secure?', a: 'We use industry-standard practices. See our Security section for details.' },
  { q: 'Do points expire?', a: 'No. Points never expire and there are no monthly fees.' },
]

export const FAQSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">FAQs</h2>
          <p className="mt-3 text-gray-600">Quick answers to common questions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {faqs.map((f) => (
            <div key={f.q} className="p-5 rounded-xl border border-[var(--brand-purple-20)] bg-white">
              <h3 className="text-lg font-semibold text-[var(--brand-text-hex)]">{f.q}</h3>
              <p className="text-gray-600 mt-1 text-sm">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQSection


