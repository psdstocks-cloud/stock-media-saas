'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  points: number
  rolloverLimit: number
  isActive: boolean
}

interface PasswordStrength {
  score: number
  label: string
  color: string
  requirements: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
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
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: '',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  })
  const [showWeakPasswordPopup, setShowWeakPasswordPopup] = useState(false)
  const [weakPasswordConsent, setWeakPasswordConsent] = useState(false)
  const router = useRouter()

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }

    let score = 0
    if (requirements.length) score += 1
    if (requirements.uppercase) score += 1
    if (requirements.lowercase) score += 1
    if (requirements.number) score += 1
    if (requirements.special) score += 1

    let label = ''
    let color = ''
    
    if (score <= 1) {
      label = 'Very Weak'
      color = '#dc2626'
    } else if (score === 2) {
      label = 'Weak'
      color = '#f59e0b'
    } else if (score === 3) {
      label = 'Fair'
      color = '#eab308'
    } else if (score === 4) {
      label = 'Good'
      color = '#10b981'
    } else {
      label = 'Strong'
      color = '#059669'
    }

    return { score, label, color, requirements }
  }

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
        // Fallback plans if API fails
        const fallbackPlans = [
          {
            id: 'starter-fallback',
            name: 'starter',
            description: 'Perfect for individuals and small projects',
            price: 9.99,
            points: 50,
            rolloverLimit: 25,
            isActive: true
          },
          {
            id: 'professional-fallback',
            name: 'professional',
            description: 'Ideal for freelancers and small agencies',
            price: 29.99,
            points: 200,
            rolloverLimit: 100,
            isActive: true
          },
          {
            id: 'business-fallback',
            name: 'business',
            description: 'Perfect for agencies and design teams',
            price: 79.99,
            points: 600,
            rolloverLimit: 300,
            isActive: true
          },
          {
            id: 'enterprise-fallback',
            name: 'enterprise',
            description: 'For large agencies and enterprises',
            price: 199.99,
            points: 1500,
            rolloverLimit: 750,
            isActive: true
          }
        ]
        setPlans(fallbackPlans)
        setSelectedPlan(fallbackPlans[0].id)
      }
    }

    fetchPlans()
  }, [])

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength({
        score: 0,
        label: '',
        color: '',
        requirements: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false
        }
      })
    }
  }, [formData.password])

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

    // Check for weak password and show popup if needed
    if (passwordStrength.score <= 2 && !weakPasswordConsent) {
      setShowWeakPasswordPopup(true)
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

  const handleWeakPasswordConsent = () => {
    setWeakPasswordConsent(true)
    setShowWeakPasswordPopup(false)
    // Retry form submission
    handleSubmit(new Event('submit') as any)
  }

  const handleWeakPasswordCancel = () => {
    setShowWeakPasswordPopup(false)
    setWeakPasswordConsent(false)
  }

  const features = [
    {
      icon: '⚡',
      title: "Instant Downloads",
      description: "Download your media files instantly with our high-speed CDN"
    },
    {
      icon: '🛡️',
      title: "Commercial License",
      description: "Full commercial rights for all downloads with no attribution required"
    },
    {
      icon: '🌍',
      title: "500+ Stock Sites",
      description: "Access to premium stock sites worldwide in one unified platform"
    },
    {
      icon: '🕐',
      title: "24/7 Support",
      description: "Round-the-clock customer support from our expert team"
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0'
          }}>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>SM</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
                StockMedia Pro
              </span>
            </Link>
            <Link href="/login">
              <button style={{
                padding: '8px 16px',
                color: '#64748b',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
              }}>
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 1rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 48px)',
            fontWeight: 'bold',
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            Start Your Creative Journey
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#64748b',
            maxWidth: '768px',
            margin: '0 auto'
          }}>
            Join thousands of creators who trust StockMedia Pro for their premium stock media needs.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '48px',
          alignItems: 'start'
        }}>
          {/* Registration Form */}
          <div>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: 'none',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '32px',
                textAlign: 'center',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>
                  Create Your Account
                </h2>
                <p style={{
                  color: '#64748b',
                  fontSize: '16px'
                }}>
                  Get started with your free trial today
                </p>
              </div>
              <div style={{ padding: '32px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div>
                        <label htmlFor="name" style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          Full Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          Email Address
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Enter your email address"
                        />
                      </div>
                      <div>
                        <label htmlFor="password" style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          Password
                        </label>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: passwordStrength.score > 0 ? `1px solid ${passwordStrength.color}` : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Create a strong password"
                        />
                        
                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <div style={{ marginTop: '8px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              <div style={{
                                display: 'flex',
                                gap: '2px',
                                flex: 1
                              }}>
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      height: '4px',
                                      flex: 1,
                                      borderRadius: '2px',
                                      background: i < passwordStrength.score ? passwordStrength.color : '#e5e7eb',
                                      transition: 'all 0.3s ease'
                                    }}
                                  />
                                ))}
                              </div>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: '500',
                                color: passwordStrength.color
                              }}>
                                {passwordStrength.label}
                              </span>
                            </div>
                            
                            {/* Password Requirements */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px'
                              }}>
                                <span style={{
                                  color: passwordStrength.requirements.length ? '#10b981' : '#6b7280'
                                }}>
                                  {passwordStrength.requirements.length ? '✓' : '○'}
                                </span>
                                <span style={{
                                  color: passwordStrength.requirements.length ? '#10b981' : '#6b7280'
                                }}>
                                  At least 8 characters
                                </span>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px'
                              }}>
                                <span style={{
                                  color: passwordStrength.requirements.uppercase ? '#10b981' : '#6b7280'
                                }}>
                                  {passwordStrength.requirements.uppercase ? '✓' : '○'}
                                </span>
                                <span style={{
                                  color: passwordStrength.requirements.uppercase ? '#10b981' : '#6b7280'
                                }}>
                                  One uppercase letter
                                </span>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px'
                              }}>
                                <span style={{
                                  color: passwordStrength.requirements.lowercase ? '#10b981' : '#6b7280'
                                }}>
                                  {passwordStrength.requirements.lowercase ? '✓' : '○'}
                                </span>
                                <span style={{
                                  color: passwordStrength.requirements.lowercase ? '#10b981' : '#6b7280'
                                }}>
                                  One lowercase letter
                                </span>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px'
                              }}>
                                <span style={{
                                  color: passwordStrength.requirements.number ? '#10b981' : '#6b7280'
                                }}>
                                  {passwordStrength.requirements.number ? '✓' : '○'}
                                </span>
                                <span style={{
                                  color: passwordStrength.requirements.number ? '#10b981' : '#6b7280'
                                }}>
                                  One number
                                </span>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px'
                              }}>
                                <span style={{
                                  color: passwordStrength.requirements.special ? '#10b981' : '#6b7280'
                                }}>
                                  {passwordStrength.requirements.special ? '✓' : '○'}
                                </span>
                                <span style={{
                                  color: passwordStrength.requirements.special ? '#10b981' : '#6b7280'
                                }}>
                                  One special character
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          Confirm Password
                        </label>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Confirm your password"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Plan Selection */}
                  {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#0f172a',
                          marginBottom: '16px'
                        }}>
                          Choose Your Plan
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {plans.map((plan) => (
                            <div
                              key={plan.id}
                              style={{
                                padding: '16px',
                                border: selectedPlan === plan.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                background: selectedPlan === plan.id ? '#eff6ff' : 'white'
                              }}
                              onClick={() => setSelectedPlan(plan.id)}
                            >
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px'
                                }}>
                                  <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    border: selectedPlan === plan.id ? '2px solid #3b82f6' : '2px solid #d1d5db',
                                    background: selectedPlan === plan.id ? '#3b82f6' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {selectedPlan === plan.id && (
                                      <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: 'white'
                                      }} />
                                    )}
                                  </div>
                                  <div>
                                    <h4 style={{
                                      fontWeight: '600',
                                      color: '#0f172a',
                                      textTransform: 'capitalize'
                                    }}>
                                      {plan.name}
                                    </h4>
                                    <p style={{
                                      fontSize: '14px',
                                      color: '#64748b'
                                    }}>
                                      {plan.name === 'starter' && 'Perfect for individuals and small projects'}
                                      {plan.name === 'professional' && 'Ideal for freelancers and small agencies'}
                                      {plan.name === 'business' && 'Perfect for agencies and design teams'}
                                      {plan.name === 'enterprise' && 'For large agencies and enterprises'}
                                    </p>
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#0f172a'
                                  }}>
                                    ${plan.price}
                                  </div>
                                  <div style={{
                                    fontSize: '14px',
                                    color: '#64748b'
                                  }}>
                                    /month
                                  </div>
                                </div>
                              </div>
                              <div style={{
                                marginTop: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                fontSize: '14px',
                                color: '#64748b'
                              }}>
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
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '16px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        color: '#dc2626'
                      }}>
                        ⚠️
                      </div>
                      <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '16px'
                  }}>
                    {step === 2 && (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        style={{
                          flex: 1,
                          padding: '12px 24px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          background: 'white',
                          color: '#374151',
                          fontSize: '16px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Back
                      </button>
                    )}
                    {step === 1 ? (
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        style={{
                          flex: 1,
                          padding: '12px 24px',
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Continue →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                          flex: 1,
                          padding: '12px 24px',
                          background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '500',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account →'}
                      </button>
                    )}
                  </div>
                </form>

                <div style={{
                  marginTop: '24px',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    margin: 0
                  }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{
                      color: '#2563eb',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Sidebar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              borderRadius: '16px',
              border: '1px solid #bfdbfe',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                Why Choose StockMedia Pro?
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {features.map((feature, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: '#dbeafe',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0
                    }}>
                      {feature.icon}
                    </div>
                    <div>
                      <h4 style={{
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '4px'
                      }}>
                        {feature.title}
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: 0
                      }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                What Our Users Say
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '4px'
                  }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>
                    ))}
                  </div>
                  <div>
                    <p style={{
                      color: '#374151',
                      fontSize: '14px',
                      marginBottom: '8px',
                      margin: 0
                    }}>
                      "StockMedia Pro has revolutionized our workflow. The quality and variety of content is unmatched."
                    </p>
                    <p style={{
                      color: '#64748b',
                      fontSize: '12px',
                      margin: 0
                    }}>
                      - Sarah Johnson, Creative Director
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '4px'
                  }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>
                    ))}
                  </div>
                  <div>
                    <p style={{
                      color: '#374151',
                      fontSize: '14px',
                      marginBottom: '8px',
                      margin: 0
                    }}>
                      "The API integration is seamless. We've saved hours of manual work with their automation features."
                    </p>
                    <p style={{
                      color: '#64748b',
                      fontSize: '12px',
                      margin: 0
                    }}>
                      - Mike Chen, Marketing Manager
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              borderRadius: '16px',
              border: '1px solid #bbf7d0',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px'
              }}>
                🛡️
              </div>
              <h3 style={{
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                30-Day Money Back Guarantee
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: 0
              }}>
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weak Password Popup */}
      {showWeakPasswordPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#fef3c7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                ⚠️
              </div>
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  margin: 0
                }}>
                  Weak Password Detected
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  margin: '4px 0 0 0'
                }}>
                  Your password strength is: <span style={{ color: passwordStrength.color, fontWeight: '600' }}>{passwordStrength.label}</span>
                </p>
              </div>
            </div>

            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#dc2626',
                margin: '0 0 12px 0'
              }}>
                Security Risks of Weak Passwords:
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                color: '#7f1d1d',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                <li>Easily guessed by attackers</li>
                <li>Vulnerable to brute force attacks</li>
                <li>Higher risk of account compromise</li>
                <li>May not meet security standards</li>
              </ul>
            </div>

            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e40af',
                margin: '0 0 12px 0'
              }}>
                Recommendations:
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                color: '#1e3a8a',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                <li>Use at least 8 characters</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Add numbers and special characters</li>
                <li>Avoid common words or patterns</li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              gap: '16px'
            }}>
              <button
                onClick={handleWeakPasswordCancel}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#374151',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Improve Password
              </button>
              <button
                onClick={handleWeakPasswordConsent}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Use Weak Password
              </button>
            </div>

            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'center',
              margin: '16px 0 0 0'
            }}>
              By proceeding, you acknowledge the security risks and accept responsibility for using a weak password.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}