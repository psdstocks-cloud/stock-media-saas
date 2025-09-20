'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Settings, Key, CreditCard } from 'lucide-react'
import { ApiKeysManager } from '@/components/settings/ApiKeysManager'
import { BillingManager } from '@/components/settings/BillingManager'

type TabType = 'api-keys' | 'billing'

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState<TabType>('api-keys')

  const tabs = [
    {
      id: 'api-keys' as const,
      label: 'API Keys',
      icon: Key,
      description: 'Manage your API keys for programmatic access'
    },
    {
      id: 'billing' as const,
      label: 'Billing',
      icon: CreditCard,
      description: 'Manage your subscription and billing information'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-3xl font-bold">
            Settings
          </Typography>
          <Typography variant="body" color="muted" className="mt-2">
            Manage your account settings and preferences
          </Typography>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="py-4">
        <Typography variant="body" color="muted">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </Typography>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'api-keys' && <ApiKeysManager />}
        {activeTab === 'billing' && <BillingManager />}
      </div>
    </div>
  )
}
