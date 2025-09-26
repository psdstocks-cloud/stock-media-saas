import type { Metadata } from 'next'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing • Stock Media SaaS',
  description: 'Simple, transparent pricing. Buy point packs or subscribe monthly for savings.',
  openGraph: {
    title: 'Pricing • Stock Media SaaS',
    description: 'Choose point packs or monthly subscriptions with commercial licensing included.'
  }
}

export default function PricingPage() {
  return <PricingClient />
}

