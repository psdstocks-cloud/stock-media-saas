import FeatureFlagsClient from './FeatureFlagsClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Feature Flags • Stock Media SaaS',
  description: 'Toggle features and rollouts',
}

export default function FeatureFlagsPage() {
  return <FeatureFlagsClient />
}
