'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ArrowRight, 
  Shield, 
  Star, 
  Users, 
  Zap,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const router = useRouter()

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if user is already logged in
  useEffect(() => {
    if (mounted) {
      getSession().then((session) => {
        if (session) {
          router.push('/dashboard')
        }
      })
    }
  }, [mounted, router])

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password validation
  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  // Real-time validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    
    if (value && !validatePassword(value)) {
      setPasswordError('Password must be at least 6 characters')
    } else {
      setPasswordError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mounted) return
    
    // Clear previous errors
    setError('')
    setEmailError('')
    setPasswordError('')

    // Validate form
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    
    setIsLoading(true)
    setIsValidating(true)

    try {
      console.log('Attempting to sign in with:', { email, password: '***' })
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      console.log('SignIn result:', result)

      if (result?.error) {
        console.error('Sign-in error:', result.error)
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (result.error === 'CallbackRouteError') {
          setError('Authentication service error. Please try again.')
        } else {
          setError(`Authentication failed: ${result.error}`)
        }
      } else if (result?.ok) {
        // Show success state briefly before redirect
        setIsValidating(false)
        console.log('Login successful, redirecting to dashboard')
        console.log('Result details:', result)
        
        // Wait a moment for session to be established
        setTimeout(() => {
          console.log('Attempting redirect to dashboard')
          try {
            window.location.href = '/dashboard'
          } catch (error) {
            console.error('Redirect error:', error)
            // Fallback to router
            router.push('/dashboard')
          }
        }, 1000)
      } else {
        console.log('Login failed - no result:', result)
        setError('Login failed. Please check your credentials and try again.')
      }
    } catch (error) {
      console.error('Sign-in exception:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      setIsValidating(false)
    }
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="bg-card p-8 rounded-xl shadow-lg text-center">
          <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .gradient-animated {
            background: linear-gradient(-45deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)), hsl(var(--accent)));
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }
        `
      }} />
      
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-animated opacity-20"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        {/* Centered Login Card */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
            <CardHeader className="space-y-6 text-center">
              {/* Brand Logo */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
                  <Sparkles size={32} className="text-primary-foreground" />
                </div>
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
                <CardDescription className="text-base">
                  Sign in to access your StockMedia Pro account
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle size={20} className="text-destructive" />
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      className={`pl-10 ${emailError ? 'border-destructive' : email ? 'border-green-500' : ''}`}
                      placeholder="Enter your email"
                    />
                    {email && !emailError && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {emailError && (
                    <p className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle size={16} />
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      className={`pl-10 pr-10 ${passwordError ? 'border-destructive' : password ? 'border-green-500' : ''}`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle size={16} />
                      {passwordError}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember" className="text-sm">Remember me</Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || isValidating}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : isValidating ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Success! Redirecting...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-primary hover:underline font-medium">
                    Sign up here
                  </Link>
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-1 gap-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-secondary" />
                    <span>Instant downloads with commercial licensing</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-secondary" />
                    <span>Secure, encrypted transactions</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-secondary" />
                    <span>Join 10,000+ satisfied creators</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}