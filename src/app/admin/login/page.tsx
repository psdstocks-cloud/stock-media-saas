'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Mail, Lock, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

interface LoginCredentials {
  email: string
  password: string
}

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  })

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking existing authentication...')
        
        const response = await fetch('/api/admin/auth/me', {
          credentials: 'include',
          cache: 'no-cache'
        })

        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user) {
            console.log('✅ User already authenticated, redirecting...')
            router.replace('/admin/dashboard')
            return
          }
        }
        
        console.log('ℹ️ No existing authentication found')
      } catch (error) {
        console.log('🔍 Auth check failed:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setAuthError(null)
      console.log('🚀 Attempting login for:', data.email)

      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      const result = await response.json()
      console.log('📋 Login response:', { status: response.status, success: result.success })

      if (!response.ok) {
        setAuthError(result.error || 'Login failed')
        return
      }

      if (result.success) {
        console.log('✅ Login successful, redirecting...')
        // Small delay to ensure cookies are set
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 100)
      }
    } catch (err) {
      console.error('💥 Login error:', err)
      setAuthError('Network error. Please try again.')
    }
  }

  // Show loading while checking initial auth state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="flex items-center space-x-4 p-8">
            <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
            <div>
              <h4 className="text-white font-semibold text-lg">Loading...</h4>
              <p className="text-white/70 mt-1">Checking authentication</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="absolute top-6 left-6">
          <Link
            href="/"
            className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Site</span>
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Admin Access
            </CardTitle>
            <p className="text-white/70">
              Sign in to access the admin dashboard
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-white/90 font-medium text-sm">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 pl-4 pr-10 h-12"
                    placeholder="admin@test.com"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-white/90 font-medium text-sm">
                  Password
                </label>
                <div className="relative">
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 pl-4 pr-20 h-12"
                    placeholder="Enter your password"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/50 hover:text-white/70 p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <Lock className="h-4 w-4 text-white/50" />
                  </div>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password.message}</p>
                )}
              </div>

              {authError && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                  <AlertDescription className="text-red-200">
                    {authError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/50 text-sm">
                Test credentials: admin@test.com / admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}