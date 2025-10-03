'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function AdminSetupPage() {
  const [adminStatus, setAdminStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const checkAdminStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/setup-super-admin')
      const data = await response.json()
      setAdminStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const createSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/setup-super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Super admin created successfully!')
        setFormData({ email: '', password: '', name: '' })
        checkAdminStatus() // Refresh status
      } else {
        setError(data.error || 'Failed to create super admin')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    checkAdminStatus()
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <Typography variant="h1" className="text-3xl font-bold mb-2">
            Admin Setup
          </Typography>
          <Typography variant="body" className="text-muted-foreground">
            Set up the initial super admin account for the system
          </Typography>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Super Admin Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Checking admin status...</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {adminStatus && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {adminStatus.exists ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <Typography variant="h3" className={adminStatus.exists ? 'text-green-600' : 'text-red-600'}>
                    {adminStatus.exists ? 'Super Admin Exists' : 'No Super Admin Found'}
                  </Typography>
                </div>

                {adminStatus.exists && adminStatus.admin && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <Typography variant="h4" className="font-semibold mb-2">Existing Super Admin</Typography>
                    <div className="space-y-2 text-sm">
                      <div><strong>Email:</strong> {adminStatus.admin.email}</div>
                      <div><strong>Name:</strong> {adminStatus.admin.name}</div>
                      <div><strong>Role:</strong> {adminStatus.admin.role}</div>
                      <div><strong>Created:</strong> {new Date(adminStatus.admin.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-4">
                      <Button asChild>
                        <a href="/admin/login">Go to Admin Login</a>
                      </Button>
                    </div>
                  </div>
                )}

                {!adminStatus.exists && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <Typography variant="h4" className="font-semibold mb-2">Create Super Admin</Typography>
                    <Typography variant="body" className="mb-4">
                      No super admin account exists. Create one to get started.
                    </Typography>
                    
                    <form onSubmit={createSuperAdmin} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="admin@example.com"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter a strong password"
                          required
                          minLength={8}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Name (Optional)</label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Super Admin"
                        />
                      </div>
                      
                      <Button type="submit" disabled={creating} className="w-full">
                        {creating ? (
                          <div className="flex items-center space-x-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Creating...</span>
                          </div>
                        ) : (
                          'Create Super Admin'
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            )}

            <Button onClick={checkAdminStatus} disabled={loading} variant="outline" className="w-full">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
