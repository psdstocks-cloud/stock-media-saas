'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function AuthStatusPage() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuthStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/auth-test')
      const data = await response.json()
      
      if (response.ok) {
        setAuthStatus(data)
      } else {
        setError(data.error || 'Authentication check failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <Typography variant="h1" className="text-3xl font-bold mb-2">
            Admin Authentication Status
          </Typography>
          <Typography variant="body" className="text-muted-foreground">
            Debug authentication issues and check admin access
          </Typography>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Authentication Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Checking authentication...</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {authStatus && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {authStatus.authenticated ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <Typography variant="h3" className={authStatus.authenticated ? 'text-green-600' : 'text-red-600'}>
                    {authStatus.authenticated ? 'Authenticated' : 'Not Authenticated'}
                  </Typography>
                </div>

                {authStatus.authenticated && authStatus.user && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <Typography variant="h4" className="font-semibold mb-2">User Information</Typography>
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {authStatus.user.id}</div>
                      <div><strong>Email:</strong> {authStatus.user.email}</div>
                      <div><strong>Name:</strong> {authStatus.user.name || 'N/A'}</div>
                      <div><strong>Role:</strong> {authStatus.user.role}</div>
                    </div>
                  </div>
                )}

                {!authStatus.authenticated && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <Typography variant="h4" className="font-semibold mb-2">Authentication Required</Typography>
                    <Typography variant="body" className="mb-2">
                      You need to log in as an admin to access the admin panel.
                    </Typography>
                    <Button asChild>
                      <a href="/admin/login">Go to Admin Login</a>
                    </Button>
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <Typography variant="h4" className="font-semibold mb-2">Debug Information</Typography>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(authStatus, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <Button onClick={checkAuthStatus} disabled={loading} className="w-full">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
