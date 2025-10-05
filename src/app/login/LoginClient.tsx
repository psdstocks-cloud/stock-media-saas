'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Input,
  Label,
  Typography,
  Alert,
  AlertDescription
} from '@/components/ui'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  LogIn,
  User,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demo123')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const redirect = searchParams.get('redirect') || '/dashboard'

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 [Login] Checking existing user authentication...')
        
        const response = await fetch('/api/auth/status', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user) {
            console.log('✅ [Login] User already authenticated, redirecting...')
            router.replace(redirect)
            return
          }
        }
        
        console.log('ℹ️ [Login] No existing authentication found')
      } catch (error) {
        console.log('🔍 [Login] Auth check failed:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🚀 [Login] Attempting user login for:', email)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await response.json()
      console.log('📋 [Login] Login response:', { status: response.status, success: data.success })

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      if (data.success) {
        console.log('✅ [Login] Login successful, redirecting to:', redirect)
        router.push(redirect)
      }
    } catch (err) {
      console.error('💥 [Login] Login error:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <div className="absolute top-6 left-6">
          <Link href="/" className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">SM</span>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-white">Welcome Back</CardTitle>
              <CardDescription className="text-white/70 mt-2">
                Sign in to your Stock Media SaaS account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                  <AlertCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" aria-hidden="true" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="demo@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500 pl-10"
                    disabled={isLoading}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" aria-hidden="true" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500 pl-10 pr-10"
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <p className="text-white/50 text-sm mb-4">
                  💡 Having trouble? Try the demo account below or contact support
                </p>
                <div className="bg-white/5 rounded-lg p-3 text-left">
                  <p className="text-white/70 text-xs font-medium mb-1">Demo Account:</p>
                  <p className="text-white text-sm">📧 demo@example.com</p>
                  <p className="text-white text-sm">🔑 demo123</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-white/70 text-sm">
                  Don't have an account? <Link href="/register" className="text-orange-400 hover:text-orange-300 font-medium">Sign up</Link>
                </p>
                <p className="text-white/70 text-sm">
                  Forgot your password? <Link href="/forgot-password" className="text-orange-400 hover:text-orange-300 font-medium">Reset it here</Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <Typography variant="body" className="text-white/70">Loading...</Typography>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}


