'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
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
  Shield
} from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [isResendingVerification, setIsResendingVerification] = useState(false)

  // Handle URL parameters for verification status
  useEffect(() => {
    const verified = searchParams.get('verified')
    const verificationError = searchParams.get('error')
    const requestVerification = searchParams.get('requestVerification')
    const message = searchParams.get('message')

    if (verified === 'true') {
      setVerificationMessage('Email verified successfully! You can now log in.')
    } else if (verificationError) {
      setError(decodeURIComponent(verificationError))
    } else if (requestVerification === 'true') {
      setVerificationMessage('Please check your email for a verification link.')
    } else if (message) {
      setVerificationMessage(decodeURIComponent(message))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with:', { email, password: password ? '***' : 'empty' })
    setIsLoading(true)
    setError('')

    try {
      // Client-side validation
      let hasClientError = false
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailError('Please enter a valid email')
        hasClientError = true
      } else {
        setEmailError('')
      }
      if (!password || password.length < 6) {
        setPasswordError('Password must be at least 6 characters')
        hasClientError = true
      } else {
        setPasswordError('')
      }
      if (hasClientError) {
        setIsLoading(false)
        return
      }
      // First test with simple login API
      console.log('Making test login request to /api/test-login')
      const testResponse = await fetch('/api/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      })

      console.log('Test login response status:', testResponse.status)
      const testData = await testResponse.json()
      console.log('Test login response data:', testData)

      if (!testResponse.ok) {
        // Provide more specific error messages
        if (testData.error === 'User not found') {
          setError('No account found with this email address. Please check your email or create a new account.')
        } else if (testData.error === 'Invalid password') {
          setError('Incorrect password. Please check your password and try again.')
        } else if (testData.error === 'Account locked') {
          setError('Account temporarily locked due to multiple failed attempts. Please try again later.')
        } else if (testData.error === 'Email not verified') {
          setError('Please verify your email address before logging in. Check your inbox for a verification link.')
        } else {
          setError(testData.error || 'Login failed. Please check your credentials and try again.')
        }
        return
      }

      // If test login works, try the full login
      console.log('Test login successful, trying full login')
      const response = await fetch('/api/auth/direct-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      })

      console.log('Full login response status:', response.status)
      const data = await response.json()
      console.log('Full login response data:', data)

      if (response.ok) {
        console.log('Full login successful, redirecting to:', data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard')
        // Login successful, redirect based on user role
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        console.log('Full login failed:', data)
        // Handle different error types
        if (data.type === 'ACCOUNT_LOCKED') {
          setError('Account is temporarily locked. Please try again later.')
        } else if (data.type === 'RATE_LIMIT_EXCEEDED') {
          setError('Too many login attempts. Please try again later.')
        } else if (data.type === 'OAUTH_ONLY_ACCOUNT') {
          setError('This account uses social login. Please use the appropriate login method.')
        } else {
          setError(data.error || 'Invalid email or password')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    console.log('Demo login clicked')
    setEmail('demo@example.com')
    setPassword('demo123')
    setIsLoading(true)
    setError('')

    try {
      console.log('Making demo login request to /api/auth/direct-login')
      // Use direct login API that creates JWT token
      const response = await fetch('/api/auth/direct-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'demo123',
        }),
      })

      console.log('Demo login response status:', response.status)
      const data = await response.json()
      console.log('Demo login response data:', data)

      if (response.ok) {
        console.log('Demo login successful, redirecting to dashboard')
        // Login successful, redirect to dashboard
        router.push('/dashboard')
      } else {
        console.log('Demo login failed:', data)
        setError(data.error || 'Demo account login failed')
      }
    } catch (error) {
      console.error('Demo login error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setIsResendingVerification(true)
    setError('')
    setVerificationMessage('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setVerificationMessage('Verification email sent! Please check your inbox and spam folder.')
      } else {
        setError(data.error || 'Failed to resend verification email')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsResendingVerification(false)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-2xl">
            <span className="text-white font-bold text-xl">SM</span>
          </div>
          <Typography variant="h1" className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </Typography>
          <Typography variant="body" className="text-white/70">
            Sign in to your Stock Media SaaS account
          </Typography>
        </div>

        {/* Login Form */}
        <Card className="w-full surface-card shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <LogIn className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Sign In</CardTitle>
            <CardDescription className="text-white/70">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              {/* Verification Message */}
              {verificationMessage && (
                <Alert className="bg-green-500/10 border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-200">{verificationMessage}</AlertDescription>
                </Alert>
              )}

              {/* Helpful Info */}
              {!error && !verificationMessage && (
                <Alert className="bg-blue-500/10 border-blue-500/30">
                  <AlertDescription className="text-blue-200 text-sm">
                    🔐 Secure login with email verification and account protection
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500 pl-10"
                    disabled={isLoading}
                    required
                  />
                  {emailError && (
                    <div role="alert" aria-live="polite" className="mt-1 text-sm text-red-300">{emailError}</div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500 pl-10 pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && (
                  <div role="alert" aria-live="polite" className="mt-1 text-sm text-red-300">{passwordError}</div>
                )}
                {/* Helpful guidance */}
                <div className="text-xs text-white/50">
                  💡 Having trouble? Try the demo account below or contact support
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-4">
              <div className="text-center text-sm text-white/70">
                Don't have an account?{' '}
                <a 
                  href="/register" 
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  Sign up
                </a>
              </div>
              
              <div className="text-center text-sm text-white/70">
                Forgot your password?{' '}
                <a 
                  href="/forgot-password" 
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  Reset it here
                </a>
              </div>

              <div className="text-center text-sm text-white/70">
                Need to verify your email?{' '}
                <button 
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResendingVerification ? 'Sending...' : 'Resend verification'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials Card */}
        <Card className="w-full surface-card shadow-2xl mt-6">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-400" />
            </div>
            <CardTitle className="text-xl font-bold text-white">Demo Account</CardTitle>
            <CardDescription className="text-white/70">
              Use these credentials to test the platform
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2 text-white">
                <Mail className="h-4 w-4 text-white/70" />
                <span className="font-medium">Email:</span>
                <span className="text-orange-400">demo@example.com</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <Lock className="h-4 w-4 text-white/70" />
                <span className="font-medium">Password:</span>
                <span className="text-orange-400">demo123</span>
              </div>
            </div>

            <Button
              onClick={handleDemoLogin}
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10"
              disabled={isLoading}
            >
              <User className="h-4 w-4 mr-2" />
              Login as Demo User
            </Button>
          </CardContent>
        </Card>

        {/* Admin Login Card */}
        <Card className="w-full surface-card shadow-2xl mt-6">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
            <CardTitle className="text-xl font-bold text-white">Admin Access</CardTitle>
            <CardDescription className="text-white/70">
              Administrative credentials for platform management
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2 text-white">
                <Mail className="h-4 w-4 text-white/70" />
                <span className="font-medium">Email:</span>
                <span className="text-purple-400">admin@stockmedia.com</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <Lock className="h-4 w-4 text-white/70" />
                <span className="font-medium">Password:</span>
                <span className="text-purple-400">admin123</span>
              </div>
            </div>

            <div className="text-center text-xs text-white/50">
              <p className="mb-2">
                <strong>Note:</strong> Please change the password after first login for security.
              </p>
              <p>
                Admin access provides full platform management capabilities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
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
