'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userRegistrationSchema } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'
import WeakPasswordModal from '../modals/WeakPasswordModal'
import type { z } from 'zod'

type FormData = z.infer<typeof userRegistrationSchema>

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [isWeakPasswordModalOpen, setIsWeakPasswordModalOpen] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setError
  } = useForm<FormData>({
    resolver: zodResolver(userRegistrationSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  // Function to check if password is weak (meets minimum but below threshold)
  const isPasswordWeak = (password: string): boolean => {
    if (!password) return false
    
    const requirements = [
      password.length >= 8,           // Length
      /[A-Z]/.test(password),         // Uppercase
      /[a-z]/.test(password),         // Lowercase
      /\d/.test(password),            // Number
      /[^A-Za-z0-9]/.test(password)   // Special character
    ]
    
    const metCount = requirements.filter(Boolean).length
    const totalCount = requirements.length
    const strengthPercentage = (metCount / totalCount) * 100
    
    // Consider password weak if it meets minimum requirements (all 5) but has low complexity
    // This catches passwords like "Password123" or "Abc123!@" that meet requirements but are predictable
    if (metCount === totalCount) {
      // Check for common weak patterns even when all requirements are met
      const weakPatterns = [
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,  // All requirements met
      ]
      
      // If password is exactly minimum length and follows common patterns, consider it weak
      if (password.length <= 12 && 
          (/Password/i.test(password) || /123/i.test(password) || /abc/i.test(password))) {
        return true
      }
      
      // If password is very short (8-10 chars) even with all requirements, consider weak
      if (password.length <= 10) {
        return true
      }
    }
    
    // If strength is below 80%, consider it weak
    return strengthPercentage < 80
  }

  // Function to actually submit the form (called from modal or direct submission)
  const submitRegistration = async (data: FormData) => {
    setIsLoading(true)
    setGeneralError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        // Redirect to login page with success message
        router.push('/login?message=Registration successful! Please sign in.')
      } else {
        if (responseData.field) {
          setError(responseData.field as keyof FormData, {
            type: 'manual',
            message: responseData.message
          })
        } else {
          setGeneralError(responseData.message || 'Registration failed. Please try again.')
        }
      }
    } catch (error) {
      setGeneralError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    // Check if password is weak before submitting
    if (isPasswordWeak(data.password)) {
      setPendingFormData(data)
      setIsWeakPasswordModalOpen(true)
      return
    }

    // If password is strong enough, submit directly
    await submitRegistration(data)
  }

  // Handle proceeding with weak password from modal
  const handleWeakPasswordProceed = async () => {
    if (pendingFormData) {
      await submitRegistration(pendingFormData)
      setPendingFormData(null)
    }
  }

  // Handle canceling weak password modal
  const handleWeakPasswordCancel = () => {
    setIsWeakPasswordModalOpen(false)
    setPendingFormData(null)
  }

  // Watch password for real-time confirm password validation
  const password = watch('password')

  return (
    <Card className="w-full bg-transparent border-0 shadow-none">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
        <CardDescription className="text-white/70">
          Join Stock Media SaaS and start downloading premium content
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* General Error */}
          {generalError && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">{generalError}</AlertDescription>
            </Alert>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/90 font-medium">Name</Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                {...register('name')}
                placeholder="Enter your full name"
                disabled={isLoading}
                className={`bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                </div>
              )}
            </div>
            {errors.name && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/90 font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter your email address"
                className={`bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-orange-500 focus:ring-orange-500 pl-10 ${errors.email ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {errors.email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/90 font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Create a strong password"
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
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </p>
            )}
            
            {/* Dynamic Password Strength Indicator */}
            <PasswordStrengthIndicator 
              password={password} 
              className="mt-3"
            />
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white/90 font-medium">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="Confirm your password"
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
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !isValid || !isDirty}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-white/70">
          Already have an account?{' '}
          <a 
            href="/login" 
            className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            Log In
          </a>
        </div>
        
        <div className="text-center text-xs text-white/50">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-orange-400 hover:text-orange-300">
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="/privacy" className="text-orange-400 hover:text-orange-300">
            Privacy Policy
          </a>
        </div>
      </CardFooter>

      {/* Weak Password Confirmation Modal */}
      <WeakPasswordModal
        isOpen={isWeakPasswordModalOpen}
        onClose={handleWeakPasswordCancel}
        onProceed={handleWeakPasswordProceed}
        password={pendingFormData?.password || ''}
      />
    </Card>
  )
}
