'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CreditCard, Zap, Shield, Clock, CheckCircle, Star, Lock, AlertCircle, Loader2 } from 'lucide-react'

interface PricingPlan {
  id: string
  name: string
  points: number
  price: number
  popular?: boolean
  features: string[]
  savings?: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  description: string
  processingTime: string
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    points: 50,
    price: 9.99,
    features: [
      '50 download points',
      'High-quality stock media',
      'Instant downloads',
      'Commercial license included'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    points: 150,
    price: 24.99,
    popular: true,
    features: [
      '150 download points',
      'High-quality stock media',
      'Instant downloads',
      'Commercial license included',
      'Priority support',
      'Bulk download discounts'
    ],
    savings: 'Save 17%'
  },
  {
    id: 'business',
    name: 'Business',
    points: 500,
    price: 69.99,
    features: [
      '500 download points',
      'High-quality stock media',
      'Instant downloads',
      'Commercial license included',
      'Priority support',
      'Bulk download discounts',
      'Team collaboration',
      'Advanced analytics'
    ],
    savings: 'Save 30%'
  }
]

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credit-card',
    name: 'Credit Card',
    icon: '💳',
    description: 'Visa, Mastercard, American Express',
    processingTime: 'Instant'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    description: 'Pay with your PayPal account',
    processingTime: 'Instant'
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: '🍎',
    description: 'Touch ID or Face ID',
    processingTime: 'Instant'
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    icon: 'G',
    description: 'Quick and secure payment',
    processingTime: 'Instant'
  }
]

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string>('professional')
  const [isLoading, setIsLoading] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'success' | 'error'>('method')
  const [paymentError, setPaymentError] = useState<string>('')
  const [simulateFailure, setSimulateFailure] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchUserBalance()
  }, [session, status, router])

  const fetchUserBalance = async () => {
    try {
      const response = await fetch('/api/points')
      if (response.ok) {
        const data = await response.json()
        setUserBalance(data.balance || 0)
      }
    } catch (error) {
      console.error('Error fetching user balance:', error)
    }
  }

  const handlePurchase = async (plan: PricingPlan) => {
    setSelectedPlan(plan.id)
    setShowPaymentModal(true)
    setPaymentStep('method')
    setPaymentError('')
  }

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId)
  }

  const processVirtualPayment = async () => {
    if (!selectedPaymentMethod) {
      setPaymentError('Please select a payment method')
      return
    }

    setPaymentStep('processing')
    setPaymentError('')

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Process payment through API
      const plan = pricingPlans.find(p => p.id === selectedPlan)!
      
      const response = await fetch('/api/virtual-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          points: plan.points,
          price: plan.price,
          paymentMethod: selectedPaymentMethod,
          simulateFailure: simulateFailure,
          testMode: true // Enable test mode to avoid random failures
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setPaymentStep('success')
        // Update user balance
        await fetchUserBalance()
      } else {
        // Handle API error response
        setPaymentStep('error')
        const errorMessage = data.error || 'Payment processing failed. Please try again.'
        const errorDetails = data.details ? ` (${data.details})` : ''
        setPaymentError(`${errorMessage}${errorDetails}`)
        console.error('Payment API error:', data)
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStep('error')
      setPaymentError('Payment processing failed. Please try again.')
    }
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setPaymentStep('method')
    setSelectedPaymentMethod('')
    setPaymentError('')
  }

  const resetPayment = () => {
    setPaymentStep('method')
    setSelectedPaymentMethod('')
    setPaymentError('')
  }

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '16px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Choose Your Plan
          </h1>
          <p style={{
            fontSize: '20px',
            opacity: 0.9,
            marginBottom: '8px'
          }}>
            Get more points to download premium stock media
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            <Zap size={20} />
            Current Balance: {userBalance} points
          </div>
        </div>

        {/* Testing Controls */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '30px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>
            🧪 Testing Controls
          </h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                style={{ margin: 0 }}
              />
              Simulate Payment Failure (10% chance)
            </label>
            <div style={{ color: 'white', fontSize: '12px', opacity: 0.8 }}>
              💡 Credit Card: Up to $100 | PayPal: Min $5 | Apple Pay: Up to $50 | Google Pay: Up to $75
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
        }}>
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px 30px',
                position: 'relative',
                boxShadow: plan.popular 
                  ? '0 20px 40px rgba(0,0,0,0.1), 0 0 0 3px #667eea'
                  : '0 10px 30px rgba(0,0,0,0.1)',
                transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = plan.popular ? 'scale(1.08)' : 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = plan.popular ? 'scale(1.05)' : 'scale(1)'
                e.currentTarget.style.boxShadow = plan.popular 
                  ? '0 20px 40px rgba(0,0,0,0.1), 0 0 0 3px #667eea'
                  : '0 10px 30px rgba(0,0,0,0.1)'
              }}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '8px 24px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Star size={16} />
                  Most Popular
                </div>
              )}

              {plan.savings && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: '#22c55e',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {plan.savings}
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#1f2937'
                }}>
                  {plan.name}
                </h3>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#667eea',
                  marginBottom: '8px'
                }}>
                  ${plan.price}
                </div>
                <div style={{
                  fontSize: '18px',
                  color: '#6b7280',
                  marginBottom: '20px'
                }}>
                  {plan.points} points
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                {plan.features.map((feature, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px',
                      fontSize: '16px',
                      color: '#374151'
                    }}
                  >
                    <CheckCircle size={20} color="#22c55e" />
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePurchase(plan)
                }}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: selectedPlan === plan.id 
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                  color: selectedPlan === plan.id ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: isLoading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Processing...
                  </div>
                ) : (
                  `Get ${plan.points} Points - $${plan.price}`
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          color: 'white',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            Why Choose Our Service?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            marginTop: '30px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Zap size={30} color="white" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                Instant Access
              </h3>
              <p style={{ opacity: 0.9 }}>
                Download your files immediately after purchase
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Shield size={30} color="white" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                Secure & Licensed
              </h3>
              <p style={{ opacity: 0.9 }}>
                All downloads come with commercial licenses
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Clock size={30} color="white" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                Lifetime Access
              </h3>
              <p style={{ opacity: 0.9 }}>
                Keep your downloads forever, no expiration
              </p>
            </div>
          </div>
        </div>

        {/* Back to Browse Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={() => router.push('/dashboard/browse')}
            style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            ← Back to Browse Media
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={closePaymentModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ×
            </button>

            {paymentStep === 'method' && (
              <>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#1f2937'
                }}>
                  Choose Payment Method
                </h2>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '30px'
                }}>
                  Select your preferred payment method for testing
                </p>

                <div style={{ marginBottom: '30px' }}>
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                      style={{
                        border: selectedPaymentMethod === method.id 
                          ? '2px solid #667eea' 
                          : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: selectedPaymentMethod === method.id 
                          ? '#f8fafc' 
                          : 'white'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          fontSize: '24px',
                          width: '40px',
                          textAlign: 'center'
                        }}>
                          {method.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: '600',
                            fontSize: '16px',
                            color: '#1f2937',
                            marginBottom: '4px'
                          }}>
                            {method.name}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#6b7280'
                          }}>
                            {method.description}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#22c55e',
                          fontWeight: '500'
                        }}>
                          {method.processingTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={closePaymentModal}
                    style={{
                      padding: '12px 24px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processVirtualPayment}
                    disabled={!selectedPaymentMethod}
                    style={{
                      padding: '12px 24px',
                      background: selectedPaymentMethod 
                        ? 'linear-gradient(135deg, #667eea, #764ba2)'
                        : '#d1d5db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: selectedPaymentMethod ? 'pointer' : 'not-allowed',
                      opacity: selectedPaymentMethod ? 1 : 0.6
                    }}
                  >
                    Continue to Payment
                  </button>
                </div>
              </>
            )}

            {paymentStep === 'processing' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #667eea',
                  borderRadius: '50%',
                  margin: '0 auto 24px',
                  animation: 'spin 1s linear infinite'
                }} />
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#1f2937'
                }}>
                  Processing Payment
                </h2>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '20px'
                }}>
                  Please wait while we process your payment...
                </p>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Lock size={16} color="#22c55e" />
                    <span>Payment is encrypted and secure</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} color="#22c55e" />
                    <span>Your data is protected by industry standards</span>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#22c55e',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <CheckCircle size={40} color="white" />
                </div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#1f2937'
                }}>
                  Payment Successful!
                </h2>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '20px'
                }}>
                  Your points have been added to your account
                </p>
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#166534',
                    marginBottom: '4px'
                  }}>
                    +{pricingPlans.find(p => p.id === selectedPlan)?.points} Points Added
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#166534'
                  }}>
                    New Balance: {userBalance + (pricingPlans.find(p => p.id === selectedPlan)?.points || 0)} points
                  </div>
                </div>
                <button
                  onClick={closePaymentModal}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Continue to Dashboard
                </button>
              </div>
            )}

            {paymentStep === 'error' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <AlertCircle size={40} color="white" />
                </div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#1f2937'
                }}>
                  Payment Failed
                </h2>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '20px'
                }}>
                  {paymentError}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={resetPayment}
                    style={{
                      padding: '12px 24px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Try Again
                  </button>
                  <button
                    onClick={closePaymentModal}
                    style={{
                      padding: '12px 24px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}