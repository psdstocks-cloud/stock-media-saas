'use client'

import { Shield, Lock, CreditCard, CheckCircle } from 'lucide-react'
import { Typography } from '@/components/ui'

export function TrustBadgesSection() {
  return (
    <section className="py-12 bg-[hsl(var(--muted))] border-y border-[hsl(var(--border))]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Typography variant="body" className="text-[hsl(var(--muted-foreground))] font-medium">
            Trusted by 10,000+ creators worldwide
          </Typography>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center max-w-4xl mx-auto">
          {/* SSL Secure */}
          <div className="flex flex-col items-center text-center group">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 mb-3 group-hover:scale-110 transition-transform">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <Typography variant="body-sm" className="font-semibold text-[hsl(var(--foreground))]">
              SSL Secure
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] text-xs">
              256-bit Encryption
            </Typography>
          </div>

          {/* PCI Compliant */}
          <div className="flex flex-col items-center text-center group">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 mb-3 group-hover:scale-110 transition-transform">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <Typography variant="body-sm" className="font-semibold text-[hsl(var(--foreground))]">
              PCI Compliant
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] text-xs">
              Secure Payments
            </Typography>
          </div>

          {/* Stripe Verified */}
          <div className="flex flex-col items-center text-center group">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 mb-3 group-hover:scale-110 transition-transform">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <Typography variant="body-sm" className="font-semibold text-[hsl(var(--foreground))]">
              Stripe Verified
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] text-xs">
              Trusted Payments
            </Typography>
          </div>

          {/* Money Back */}
          <div className="flex flex-col items-center text-center group">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 mb-3 group-hover:scale-110 transition-transform">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <Typography variant="body-sm" className="font-semibold text-[hsl(var(--foreground))]">
              Money Back
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] text-xs">
              30-Day Guarantee
            </Typography>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 text-center">
          <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] mb-4">
            We Accept
          </Typography>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {/* Visa */}
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <svg className="h-8 w-auto" viewBox="0 0 48 16" fill="none">
                <path d="M18.5 2.5l-2.5 11h2.5l2.5-11h-2.5zm7.5 0l-4 11h2.5l.5-1.5h4l.5 1.5h2.5l-3.5-11h-2.5zm.5 3.5l1 3.5h-2l1-3.5zm8 4c0-2.5-3.5-2.5-3.5-3.5 0-.5.5-1 1.5-1 .5 0 1 .5 1.5.5l.5-2c-.5 0-1.5-.5-2.5-.5-2.5 0-4 1.5-4 3 0 1.5 1.5 2.5 2.5 3 1 .5 1.5 1 1.5 1.5 0 1-1 1.5-2 1.5-1 0-2-.5-2.5-.5l-.5 2c.5.5 2 .5 3 .5 2.5 0 4.5-1.5 4.5-3.5zm6.5-7.5l-1.5.5-2 10.5h2.5l.5-2.5h3.5l.5 2.5h2.5l-3.5-11h-2.5zm.5 3.5l1 3.5h-2l1-3.5z" fill="#1434CB"/>
              </svg>
            </div>

            {/* Mastercard */}
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <svg className="h-8 w-auto" viewBox="0 0 48 30" fill="none">
                <circle cx="15" cy="15" r="12" fill="#EB001B"/>
                <circle cx="33" cy="15" r="12" fill="#F79E1B"/>
                <path d="M24 6c-2.5 2-4 5-4 9s1.5 7 4 9c2.5-2 4-5 4-9s-1.5-7-4-9z" fill="#FF5F00"/>
              </svg>
            </div>

            {/* American Express */}
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <svg className="h-8 w-auto" viewBox="0 0 48 16" fill="none">
                <rect width="48" height="16" rx="2" fill="#006FCF"/>
                <path d="M8 4h4l1 2 1-2h4l-3 4 3 4h-4l-1-2-1 2H8l3-4-3-4zm16 0l-2 8h3l.5-2h2l.5 2h3l-2-8h-5zm2 2h1l.5 2h-2l.5-2zm8-2l-1.5 6h-2l1.5-6h-2l.5-2h7l-.5 2h-2z" fill="white"/>
              </svg>
            </div>

            {/* PayPal */}
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <svg className="h-8 w-auto" viewBox="0 0 48 16" fill="none">
                <path d="M19 2c-2 0-3.5 1.5-3.5 3.5v5c0 2 1.5 3.5 3.5 3.5h.5c.5 0 1-.5 1-1v-1.5h-1.5c-.5 0-1-.5-1-1v-5c0-.5.5-1 1-1h6c.5 0 1 .5 1 1v1.5h1.5v-1.5c0-.5.5-1 1-1h.5c2 0 3.5-1.5 3.5-3.5C32.5 3.5 31 2 29 2h-10z" fill="#003087"/>
                <path d="M24 6c-2 0-3.5 1.5-3.5 3.5v5c0 2 1.5 3.5 3.5 3.5h5c2 0 3.5-1.5 3.5-3.5v-5c0-2-1.5-3.5-3.5-3.5h-5zm0 2h5c.5 0 1 .5 1 1v5c0 .5-.5 1-1 1h-5c-.5 0-1-.5-1-1v-5c0-.5.5-1 1-1z" fill="#009CDE"/>
              </svg>
            </div>
          </div>
        </div>

        {/* GDPR & Privacy Badges */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>SOC 2 Type II</span>
          </div>
        </div>
      </div>
    </section>
  )
}
