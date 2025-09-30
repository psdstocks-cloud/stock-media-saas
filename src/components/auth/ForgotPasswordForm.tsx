'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mail, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Send
} from 'lucide-react'

interface FormErrors {
  email?: string
  general?: string
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const _router = useRouter()

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (value: string) => {
    setEmail(value)
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (!email.trim()) {
      setErrors({ email: 'Email is required' })
      return
    }

    if (!validateEmail(email.trim())) {
      setErrors({ email: 'Please enter a valid email address' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
      } else {
        if (data.field === 'email') {
          setErrors({ email: data.message })
        } else {
          setErrors({ general: data.message || 'Failed to send reset email. Please try again.' })
        }
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <Card className="w-full bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-400" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Check Your Email</CardTitle>
          <CardDescription className="text-white/70">
            We've sent a password reset link to your email address
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
            <AlertDescription className="text-green-200">
              If an account with this email exists, we've sent a password reset link.
            </AlertDescription>
          </Alert>

          <div className="text-center text-sm text-white/70">
            <p className="mb-2">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <p>
              The link will expire in 1 hour for security reasons.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={() => {
              setEmail('')
              setIsSuccess(false)
              setErrors({})
            }}
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Another Email
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

  // Form state
  return (
    <Card className="w-full bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
        <CardDescription className="text-white/70">
          Enter your email address to receive a reset link
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

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/90 font-medium">Email Address</Label>
            <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" aria-hidden="true" />
              <Input
                id="email"
            name="email"
                type="email"
                value={email}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter your email address"
                disabled={isLoading}
                className={`bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500 pl-10 ${errors.email ? 'border-red-500' : ''}`}
            autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email}</p>
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
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Sending Reset Link...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>Send Reset Link</span>
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
          We'll send you a secure link to reset your password
        </div>
      </CardFooter>
    </Card>
  )
}
