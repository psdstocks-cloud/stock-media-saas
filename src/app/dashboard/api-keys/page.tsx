'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Key, Plus } from 'lucide-react'

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">API Keys</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your API keys for programmatic access.</p>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Key className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No API keys yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
            Create API keys to access our services programmatically.
          </p>
          <Button className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
