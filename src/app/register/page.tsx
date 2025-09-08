'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  ArrowRight, 
  Star, 
  Shield, 
  Zap,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  points: number
  rolloverLimit: number
  isActive: boolean
}

export default function RegisterPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const router = useRouter()

  useEffect(() => {
    // Fetch subscription plans
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/subscription-plans')
        const data = await response.json()
        setPlans(data.plans || [])
        if (data.plans && data.plans.length > 0) {
          setSelectedPlan(data.plans[0].id)
        }
      } catch (error) {
        console.error('Error fetching plans:', error)
      }
    }

    fetchPlans()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    if (!selectedPlan) {
      setError('Please select a plan')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          planId: selectedPlan
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Auto sign in after registration
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.ok) {
          router.push('/dashboard')
        } else {
          router.push('/login?message=Registration successful. Please sign in.')
        }
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Instant Downloads",
      description: "Download your media files instantly with our high-speed CDN"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Commercial License",
      description: "Full commercial rights for all downloads with no attribution required"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "500+ Stock Sites",
      description: "Access to premium stock sites worldwide in one unified platform"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support from our expert team"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <span className="text-xl font-bold text-slate-900">StockMedia Pro</span>
            </Link>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Start Your Creative Journey
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Join thousands of creators who trust StockMedia Pro for their premium stock media needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Registration Form */}
          <div>
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Create Your Account
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Get started with your free trial today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-1"
                          placeholder="Enter your email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                          Password
                        </Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className="mt-1"
                          placeholder="Create a strong password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="mt-1"
                          placeholder="Confirm your password"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Plan Selection */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                          Choose Your Plan
                        </h3>
                        <div className="space-y-4">
                          {plans.map((plan) => (
                            <div
                              key={plan.id}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedPlan === plan.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                              onClick={() => setSelectedPlan(plan.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedPlan === plan.id
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-slate-300'
                                  }`}>
                                    {selectedPlan === plan.id && (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-slate-900">{plan.name}</h4>
                                    <p className="text-sm text-slate-600">{plan.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-slate-900">${plan.price}</div>
                                  <div className="text-sm text-slate-600">/month</div>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center space-x-4 text-sm text-slate-600">
                                <span>{plan.points} points/month</span>
                                <span>•</span>
                                <span>{plan.rolloverLimit}% rollover</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    {step === 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                    )}
                    {step === 1 ? (
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Sidebar */}
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Why Choose StockMedia Pro?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">
                  What Our Users Say
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div>
                    <p className="text-slate-700 text-sm mb-2">
                      "StockMedia Pro has revolutionized our workflow. The quality and variety of content is unmatched."
                    </p>
                    <p className="text-slate-600 text-xs">- Sarah Johnson, Creative Director</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div>
                    <p className="text-slate-700 text-sm mb-2">
                      "The API integration is seamless. We've saved hours of manual work with their automation features."
                    </p>
                    <p className="text-slate-600 text-xs">- Mike Chen, Marketing Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">30-Day Money Back Guarantee</h3>
                <p className="text-sm text-slate-600">
                  Not satisfied? Get a full refund within 30 days, no questions asked.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}