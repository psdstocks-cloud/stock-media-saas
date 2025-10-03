'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Lock, Eye, EyeOff, Mail, Shield, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function SimpleAdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔍 Form submitted with:', { email, password: '***' })
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log('🔍 API Response:', { status: response.status, data })

      if (response.ok && data.success) {
        // Check if user has admin role
        if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
          // Redirect to admin dashboard
          router.push('/admin/dashboard')
        } else {
          setError('Access denied. Admin privileges required.')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Site</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-orange-400" />
            <Typography variant="h4" className="text-white font-bold">
              Admin Portal
            </Typography>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white">
                  Admin Access
                </CardTitle>
                <CardDescription className="text-white/70 mt-2 text-lg">
                  Enter your admin credentials to access the dashboard
                </CardDescription>
              </div>
              <div className="flex justify-center">
                <Badge variant="outline" className="bg-orange-500/20 border-orange-500/50 text-orange-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure Authentication
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="admin-email" className="text-white/90 font-medium text-sm">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Input
                      id="admin-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500 h-12 pl-4 pr-12"
                      required
                      disabled={isLoading}
                      autoComplete="username"
                    />
                    <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="admin-password" className="text-white/90 font-medium text-sm">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500 h-12 pl-4 pr-12"
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 h-12 text-lg transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Access Dashboard</span>
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center space-y-2">
                <Typography variant="caption" className="text-white/50 block">
                  Secure admin authentication required
                </Typography>
                <Typography variant="caption" className="text-white/40 block">
                  Only users with admin privileges can access this portal
                </Typography>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="text-center">
          <Typography variant="caption" className="text-white/40">
            © 2024 Stock Media SaaS • Admin Portal
          </Typography>
        </div>
      </div>
    </div>
  )
}
