'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  ArrowRight
} from 'lucide-react'

interface FormData {
  password: string
  confirmPassword: string
}

interface FormErrors {
  password?: string
  confirmPassword?: string
  general?: string
}

interface ResetPasswordFormProps {
  token?: string
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrors({ general: 'Invalid or missing reset token' })
        setIsValidatingToken(false)
        return
      }

      try {
        const response = await fetch(`/api/validate-reset-token?token=${encodeURIComponent(token)}`)
        const data = await response.json()

        if (response.ok && data.valid) {
          setIsTokenValid(true)
        } else {
          setErrors({ general: 'Invalid or expired reset token. Please request a new password reset.' })
        }
      } catch (error) {
        setErrors({ general: 'Failed to validate reset token. Please try again.' })
      } finally {
        setIsValidatingToken(false)
      }
    }

    validateToken()
  }, [token])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!token) {
      setErrors({ general: 'Invalid or missing reset token' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?message=Password reset successful! Please sign in with your new password.')
        }, 3000)
      } else {
        if (data.field) {
          setErrors({ [data.field]: data.message })
        } else {
          setErrors({ general: data.message || 'Failed to reset password. Please try again.' })
        }
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while validating token
  if (isValidatingToken) {
    return (
      <Card className="w-full bg-transparent border-0 shadow-none">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-6 w-6 text-orange-400 animate-spin" />
          </div>
          <Typography variant="h3" className="text-xl font-bold text-white mb-2">
            Validating Reset Token...
          </Typography>
          <Typography variant="body" className="text-white/70">
            Please wait while we verify your reset link
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Token invalid state
  if (!isTokenValid || !token) {
    return (
      <Card className="w-full bg-transparent border-0 shadow-none">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Invalid Reset Link</CardTitle>
          <CardDescription className="text-white/70">
            This password reset link is invalid or has expired
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errors.general && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {errors.general}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center text-sm text-white/70">
            <p className="mb-2">
              Password reset links expire after 1 hour for security reasons.
            </p>
            <p>
              Please request a new password reset link.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={() => router.push('/forgot-password')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Request New Reset Link
          </Button>
          
          <div className="text-center text-sm text-white/70">
            Remember your password?{' '}
            <a 
              href="/login" 
              className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              Sign in here
            </a>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <Card className="w-full bg-transparent border-0 shadow-none">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Password Reset Successful!</CardTitle>
          <CardDescription className="text-white/70">
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="bg-green-500/10 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-200">
              Your password has been reset successfully. Redirecting to login...
            </AlertDescription>
          </Alert>

          <div className="text-center text-sm text-white/70">
            <p>
              You can now sign in with your new password.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={() => router.push('/login')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Form state
  return (
    <Card className="w-full bg-transparent border-0 shadow-none">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">Set New Password</CardTitle>
        <CardDescription className="text-white/70">
          Enter your new password below
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {errors.general}
              </AlertDescription>
            </Alert>
          )}

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/90 font-medium">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your new password"
                className={`bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500 pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white/90 font-medium">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your new password"
                className={`bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500 pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating Password...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Reset Password</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-white/70">
          Remember your password?{' '}
          <a 
            href="/login" 
            className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            Sign in here
          </a>
        </div>
        
        <div className="text-center text-xs text-white/50">
          Your password must be at least 8 characters with uppercase, lowercase, and numbers
        </div>
      </CardFooter>
    </Card>
  )
}
