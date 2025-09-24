'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Zap, CheckCircle2, Download } from 'lucide-react'

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      k: '1',
      title: 'Paste URL',
      desc: 'Drop in a stock media link from 50+ platforms — no sign-up hoops.',
      Icon: Zap,
    },
    {
      k: '2',
      title: 'Confirm & Process',
      desc: 'We validate, show points upfront, and begin processing instantly.',
      Icon: CheckCircle2,
    },
    {
      k: '3',
      title: 'Download',
      desc: 'Get a fresh, time-safe download link every time you need it.',
      Icon: Download,
    },
  ]

  const cardsRef = useRef<Array<HTMLDivElement | null>>([])
  const [visible, setVisible] = useState<Record<number, boolean>>({})
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setPrefersReduced(reduced)
    if (reduced) {
      setVisible({ 0: true, 1: true, 2: true })
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idxAttr = entry.target.getAttribute('data-step-index')
          if (!idxAttr) return
          const idx = parseInt(idxAttr, 10)
          if (entry.isIntersecting) {
            setVisible((v) => ({ ...v, [idx]: true }))
          }
        })
      },
      { threshold: 0.2 }
    )
    cardsRef.current.forEach((el) => {
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <section id="how-it-works" className="py-24 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How it works</h2>
          <p className="mt-3 text-gray-800">It just works — three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8 xl:gap-10 max-w-6xl mx-auto" role="list" aria-label="Steps to download stock media">
          {steps.map((s, idx) => (
            <div
              key={s.k}
              ref={(el) => (cardsRef.current[idx] = el)}
              data-step-index={idx}
              className={
                "group p-6 md:p-7 rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/60 outline-none " +
                "focus-visible:ring-2 focus-visible:ring-purple-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
                "transition-all duration-700 ease-out transform " +
                (visible[idx] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4") +
                " supports-[hover:hover]:hover:-translate-y-1 supports-[hover:hover]:hover:shadow-2xl active:scale-[.99]"
              }
              tabIndex={0}
              role="listitem"
              aria-labelledby={`how-step-${s.k}`}
              aria-describedby={`how-step-desc-${s.k}`}
              style={{ transitionDelay: prefersReduced ? undefined : `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-700">Step {s.k}</div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-center text-white transition-transform duration-300 group-hover:rotate-3">
                  <s.Icon className="w-5 h-5" aria-hidden="true" />
                </div>
              </div>
              <h3 id={`how-step-${s.k}`} className="text-xl md:text-[1.35rem] font-semibold mb-2 text-gray-900">
                {s.title}
              </h3>
              <p id={`how-step-desc-${s.k}`} className="text-gray-800 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection


