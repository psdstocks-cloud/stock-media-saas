'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key: string
  lastUsed: string | null
  createdAt: string
  isActive: boolean
}

export function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const fetchApiKeys = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/api-keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      } else {
        setError('Failed to fetch API keys')
      }
    } catch (error) {
      setError('An error occurred while fetching API keys')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const handleCreateApiKey = async () => {
    setIsCreating(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `API Key ${new Date().toLocaleDateString()}`
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys(prev => [data.apiKey, ...prev])
        setSuccess('API key created successfully!')
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create API key')
      }
    } catch (error) {
      setError('An error occurred while creating API key')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteApiKey = async (keyId: string) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')
    if (!shouldDelete) return

    setIsDeleting(keyId)
    setError('')
    
    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setApiKeys(prev => prev.filter(key => key.id !== keyId))
        setSuccess('API key deleted successfully!')
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError('Failed to delete API key')
      }
    } catch (error) {
      setError('An error occurred while deleting API key')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleCopyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setSuccess('API key copied to clipboard!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to copy API key to clipboard')
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(keyId)) {
        newSet.delete(keyId)
      } else {
        newSet.add(keyId)
      }
      return newSet
    })
  }

  const maskApiKey = (key: string, isVisible: boolean) => {
    if (isVisible) return key
    return key.substring(0, 8) + '•'.repeat(key.length - 8)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never used'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2" className="text-2xl font-bold">
            API Keys
          </Typography>
          <Typography variant="body" color="muted" className="mt-1">
            Manage your API keys for programmatic access to the Stock Media API
          </Typography>
        </div>
        <Button
          onClick={handleCreateApiKey}
          disabled={isCreating}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? 'Creating...' : 'Create New Key'}
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="bg-red-500/10 border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/10 border-green-500/30">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Your API Keys</span>
          </CardTitle>
          <CardDescription>
            Use these keys to authenticate API requests to our Stock Media service
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <Typography variant="h3" className="mb-2">
                No API Keys
              </Typography>
              <Typography variant="body" color="muted" className="mb-4">
                Create your first API key to start using our programmatic API
              </Typography>
              <Button
                onClick={handleCreateApiKey}
                disabled={isCreating}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => {
                const isVisible = visibleKeys.has(apiKey.id)
                const isKeyDeleting = isDeleting === apiKey.id
                
                return (
                  <div
                    key={apiKey.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <Typography variant="body" className="font-medium">
                          {apiKey.name}
                        </Typography>
                        <div className={`w-2 h-2 rounded-full ${apiKey.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                            {maskApiKey(apiKey.key, isVisible)}
                          </span>
                          <button
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                        <span>Created: {formatDate(apiKey.createdAt)}</span>
                        <span>Last used: {formatDate(apiKey.lastUsed)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyApiKey(apiKey.key)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                        disabled={isKeyDeleting}
                        className="text-red-600 hover:text-red-700"
                      >
                        {isKeyDeleting ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to use your API keys with our Stock Media API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Typography variant="body" className="font-medium mb-2">
                Authentication
              </Typography>
              <div className="bg-muted p-3 rounded-lg">
                <code className="text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </div>
            <div>
              <Typography variant="body" className="font-medium mb-2">
                Base URL
              </Typography>
              <div className="bg-muted p-3 rounded-lg">
                <code className="text-sm">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api
                </code>
              </div>
            </div>
            <div className="pt-2">
              <Button variant="outline" size="sm">
                View Full Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
