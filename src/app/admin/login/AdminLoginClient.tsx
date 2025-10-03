'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { Lock, Eye, EyeOff, Mail } from 'lucide-react'

export default function AdminLoginClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Use direct login API for admin authentication
      const endpoint = process.env.NEXT_PUBLIC_E2E ? '/api/admin/login-test' : '/api/admin/login'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Check if user has admin role
        if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
          // Redirect to admin dashboard
          router.push('/admin/dashboard')
        } else {
          setError('Access denied. Admin privileges required. Please contact your administrator if you believe this is an error.')
        }
      } else {
        // Handle specific error types
        if (data.type === 'EMAIL_NOT_VERIFIED') {
          setError('Email not verified. Please check your inbox for a verification link or contact your administrator.')
        } else if (data.type === 'ACCOUNT_LOCKED') {
          setError('Account temporarily locked due to multiple failed attempts. Please try again later.')
        } else if (data.type === 'RATE_LIMIT_EXCEEDED') {
          setError('Too many login attempts. Please wait a few minutes before trying again.')
        } else if (data.type === 'INVALID_CREDENTIALS') {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else {
          setError(data.error || 'Login failed. Please try again.')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Admin Access
              </CardTitle>
              <CardDescription className="text-white/70 mt-2">
                Enter your admin email and password to access the dashboard
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-white/90 font-medium">Email</label>
                <div className="relative">
                  <Input
                    id="admin-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin email"
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500"
                    required
                    disabled={isLoading}
                    autoComplete="username"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" aria-hidden="true" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-white/90 font-medium">Password</label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2.5"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Access Dashboard'
                )}
              </Button>
            </form>

            <div className="text-center">
              <Typography variant="caption" className="text-white/50">
                Secure admin authentication required
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
