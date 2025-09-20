'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Use our custom login API for better error handling
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Login successful, now use NextAuth to create session
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError('Session creation failed. Please try again.')
        } else {
          // Redirect based on user role
          if (data.user.role === 'admin') {
            router.push('/admin/dashboard')
          } else {
            router.push('/dashboard')
          }
        }
      } else {
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
    setEmail('demo@example.com')
    setPassword('demo123')
    setIsLoading(true)
    setError('')

    try {
      // Use our custom login API for better error handling
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'demo123',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Login successful, now use NextAuth to create session
        const result = await signIn('credentials', {
          email: 'demo@example.com',
          password: 'demo123',
          redirect: false,
        })

        if (result?.error) {
          setError('Demo account session creation failed')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(data.error || 'Demo account login failed')
      }
    } catch (error) {
      console.error('Demo login error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
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
        <Card className="w-full bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
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
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials Card */}
        <Card className="w-full bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl mt-6">
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
        <Card className="w-full bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl mt-6">
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
