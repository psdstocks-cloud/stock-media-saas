'use client'

import { Shield, Lock, CheckCircle, Award, Globe, Zap } from 'lucide-react'

interface SecurityBadge {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  description: string
  verified?: boolean
}

const securityBadges: SecurityBadge[] = [
  {
    icon: Shield,
    title: 'SSL Secured',
    description: '256-bit encryption',
    verified: true
  },
  {
    icon: Lock,
    title: 'SOC 2 Compliant',
    description: 'Security audited',
    verified: true
  },
  {
    icon: CheckCircle,
    title: 'GDPR Compliant',
    description: 'Privacy protected',
    verified: true
  },
  {
    icon: Award,
    title: 'ISO 27001',
    description: 'Security certified',
    verified: true
  },
  {
    icon: Globe,
    title: '99.9% Uptime',
    description: 'Reliable service',
    verified: true
  },
  {
    icon: Zap,
    title: 'Fast CDN',
    description: 'Global delivery',
    verified: true
  }
]

interface SecurityBadgesProps {
  variant?: 'compact' | 'detailed' | 'grid'
  className?: string
}

export function SecurityBadges({ variant = 'detailed', className }: SecurityBadgesProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {securityBadges.slice(0, 4).map((badge, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <badge.icon size={16} className="text-green-600" />
            <span className="font-medium">{badge.title}</span>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {securityBadges.map((badge, index) => (
          <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
            <div className="flex-shrink-0">
              <badge.icon size={24} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{badge.title}</h4>
                {badge.verified && (
                  <CheckCircle size={16} className="text-green-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Compliance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityBadges.map((badge, index) => (
          <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex-shrink-0 mt-1">
              <badge.icon size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{badge.title}</h4>
                {badge.verified && (
                  <CheckCircle size={16} className="text-green-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
