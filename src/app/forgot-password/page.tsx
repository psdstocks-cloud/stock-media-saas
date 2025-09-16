'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Shield,
  Lock,
  Clock
} from 'lucide-react'
import { PersistentTimer } from '@/lib/timer-utils'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number
    resetTime: number
    retryAfter?: number
  } | null>(null)
  const [securityInfo, setSecurityInfo] = useState<{
    checkInbox: boolean
    checkSpam: boolean
    expiresIn: string
    nextRequestIn: string
  } | null>(null)
  const [retryCountdown, setRetryCountdown] = useState(0)
  const [resendTimer, setResendTimer] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [timerInitialized, setTimerInitialized] = useState(false)
  const [checkingTimer, setCheckingTimer] = useState(false)
  const router = useRouter()

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check server timer status
  const checkServerTimerStatus = async (email: string) => {
    setCheckingTimer(true)
    try {
      const response = await fetch(`/api/check-email-timer?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (data.hasActiveTimer && data.remainingSeconds > 0) {
        setResendTimer(data.remainingSeconds)
        setCanResend(false)
        setSuccess(true) // Show success state if timer is active
        // Update localStorage with server data
        PersistentTimer.saveTimerState(email)
      }
      setTimerInitialized(true)
    } catch (error) {
      console.error('Failed to check server timer status:', error)
      setTimerInitialized(true)
    } finally {
      setCheckingTimer(false)
    }
  }

  // Countdown timer for retry
  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [retryCountdown])

  // Resend timer countdown (3 minutes) with persistence
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        const newTime = resendTimer - 1
        setResendTimer(newTime)
        
        // Update localStorage
        if (email) {
          const timerState = PersistentTimer.getTimerState()
          if (timerState) {
            timerState.remainingSeconds = newTime
            try {
              localStorage.setItem('email_resend_timer', JSON.stringify(timerState))
            } catch (error) {
              console.warn('Failed to update timer in localStorage:', error)
            }
          }
        }
      }, 1000)
      return () => clearTimeout(timer)
    } else if (resendTimer === 0 && !canResend) {
      setCanResend(true)
      // Clear timer from localStorage when expired
      if (email) {
        PersistentTimer.clearTimerState()
      }
    }
  }, [resendTimer, canResend, email])

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mounted) return
    
    // Clear previous errors
    setError('')
    setEmailError('')
    setRateLimitInfo(null)
    setSecurityInfo(null)

    // Validate form
    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setSecurityInfo(data.security || null)
        setRateLimitInfo(data.rateLimit || null)
        
        // Start persistent 3-minute resend timer
        if (data.timer?.duration) {
          setResendTimer(data.timer.duration)
          setCanResend(false)
          // Save to localStorage for persistence
          PersistentTimer.saveTimerState(email)
        }
      } else {
        if (response.status === 429) {
          // Rate limit exceeded
          setError(data.error || 'Too many requests. Please try again later.')
          setRateLimitInfo({
            remaining: 0,
            resetTime: Date.now() + (data.retryAfter || 0) * 1000,
            retryAfter: data.retryAfter
          })
          if (data.retryAfter) {
            setRetryCountdown(data.retryAfter)
          }
        } else if (data.type === 'TOO_FREQUENT') {
          // Too frequent requests
          setError(data.message || 'Please wait before requesting another email.')
          if (data.retryAfter) {
            setRetryCountdown(data.retryAfter)
          }
        } else {
          setError(data.error || 'An error occurred. Please try again.')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#64748b', margin: 0 }}>Loading...</p>
        </div>
      </div>
    )
  }


  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes checkmark {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          
          @media (max-width: 768px) {
            .forgot-password-container {
              padding: 20px !important;
            }
            
            .forgot-password-form {
              padding: 32px 24px !important;
            }
          }
          
          @media (max-width: 480px) {
            .forgot-password-form {
              padding: 24px 20px !important;
              border-radius: 16px !important;
            }
          }
        `
      }} />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }} />
        
        <div className="forgot-password-container" style={{
          maxWidth: '500px',
          width: '100%',
          zIndex: 1
        }}>
          {/* Back Button */}
          <div style={{ marginBottom: '20px' }}>
            <Link href="/login" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              opacity: 0.9,
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>

          {/* Main Form Card */}
          <div className="forgot-password-form" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            {!success ? (
              <>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
                  }}>
                    <Lock size={32} color="white" />
                  </div>
                  <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#0f172a',
                    marginBottom: '8px'
                  }}>
                    Forgot Password?
                  </h1>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    No worries! Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {/* Security Info */}
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Shield size={20} color="#3b82f6" />
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1e40af'
                    }}>
                      Secure Password Reset
                    </p>
                    <p style={{
                      margin: '4px 0 0 0',
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      Your password reset link will expire in 1 hour for security
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: emailError ? '#dc2626' : '#9ca3af',
                        zIndex: 1
                      }}>
                        <Mail size={20} />
                      </div>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={handleEmailChange}
                        style={{
                          width: '100%',
                          padding: '16px 16px 16px 48px',
                          border: `2px solid ${emailError ? '#dc2626' : email ? '#10b981' : '#e5e7eb'}`,
                          borderRadius: '12px',
                          fontSize: '16px',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                          background: 'white',
                          outline: 'none'
                        }}
                        placeholder="Enter your email address"
                        onFocus={(e) => {
                          e.target.style.borderColor = emailError ? '#dc2626' : '#3b82f6'
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = emailError ? '#dc2626' : email ? '#10b981' : '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                      {email && !emailError && (
                        <div style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#10b981'
                        }}>
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </div>
                    {emailError && (
                      <p style={{
                        color: '#dc2626',
                        fontSize: '14px',
                        margin: '8px 0 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <AlertCircle size={16} />
                        {emailError}
                      </p>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '12px'
                    }}>
                      <AlertCircle size={20} color="#dc2626" />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#dc2626', margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>
                          {error}
                        </p>
                        {retryCountdown > 0 && (
                          <p style={{ color: '#dc2626', margin: 0, fontSize: '12px', opacity: 0.8 }}>
                            Please wait {retryCountdown} seconds before trying again.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rate Limit Info */}
                  {rateLimitInfo && !error && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '12px'
                    }}>
                      <Clock size={20} color="#3b82f6" />
                      <div>
                        <p style={{ color: '#1e40af', margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>
                          Rate Limit Status
                        </p>
                        <p style={{ color: '#374151', margin: 0, fontSize: '12px' }}>
                          {rateLimitInfo.remaining} requests remaining. Resets in {Math.ceil((rateLimitInfo.resetTime - Date.now()) / 60000)} minutes.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      background: isLoading 
                        ? '#9ca3af' 
                        : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: isLoading 
                        ? 'none' 
                        : '0 4px 14px 0 rgba(59, 130, 246, 0.3)',
                      transform: isLoading ? 'none' : 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(59, 130, 246, 0.4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(59, 130, 246, 0.3)'
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success State */
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  animation: 'checkmark 0.6s ease-out'
                }}>
                  <CheckCircle size={40} color="white" />
                </div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  Check Your Email
                </h1>
                <p style={{
                  color: '#64748b',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginBottom: '32px'
                }}>
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                
                {/* Security Notice */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  textAlign: 'left'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <Shield size={16} color="#059669" />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#065f46'
                    }}>
                      Security Notice
                    </span>
                  </div>
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '13px',
                    color: '#374151',
                    lineHeight: '1.5'
                  }}>
                    For your security, we've sent the reset link to your registered email address. 
                    Please check both your inbox and spam folder.
                  </p>
                  
                  {/* Resend Timer Progress */}
                  {resendTimer > 0 && (
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <Clock size={14} color="#3b82f6" />
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#1e40af'
                        }}>
                          Resend Protection Active
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          background: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                            borderRadius: '3px',
                            width: `${((180 - resendTimer) / 180) * 100}%`,
                            transition: 'width 1s ease'
                          }} />
                        </div>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#374151',
                          minWidth: '40px',
                          textAlign: 'right'
                        }}>
                          {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <p style={{
                        margin: '8px 0 0 0',
                        fontSize: '11px',
                        color: '#6b7280',
                        lineHeight: '1.4'
                      }}>
                        You can request another reset email in {Math.floor(resendTimer / 60)} minute{Math.floor(resendTimer / 60) !== 1 ? 's' : ''} to prevent email abuse.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Instructions */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '32px',
                  textAlign: 'left'
                }}>
                  <h3 style={{
                    margin: '0 0 12px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Clock size={16} />
                    Next Steps:
                  </h3>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    color: '#374151',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the reset link in the email</li>
                    <li>Create a new secure password</li>
                    <li>Sign in with your new password</li>
                    <li>Wait 3 minutes before requesting another email</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => {
                      setSuccess(false)
                      setEmail('')
                      setError('')
                      setRateLimitInfo(null)
                      setSecurityInfo(null)
                      setRetryCountdown(0)
                      setResendTimer(0)
                      setCanResend(true)
                      setTimerInitialized(false)
                      // Clear persistent timer
                      PersistentTimer.clearTimerState()
                    }}
                    disabled={!canResend || resendTimer > 0}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      background: (!canResend || resendTimer > 0) ? '#f3f4f6' : 'transparent',
                      color: (!canResend || resendTimer > 0) ? '#9ca3af' : '#3b82f6',
                      border: `2px solid ${(!canResend || resendTimer > 0) ? '#e5e7eb' : '#3b82f6'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: (!canResend || resendTimer > 0) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (canResend && resendTimer === 0) {
                        e.currentTarget.style.background = '#3b82f6'
                        e.currentTarget.style.color = 'white'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canResend && resendTimer === 0) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#3b82f6'
                      }
                    }}
                  >
                    {resendTimer > 0 ? (
                      <>
                        <Clock size={16} />
                        Resend available in {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
                      </>
                    ) : !canResend ? (
                      <>
                        <Clock size={16} />
                        Please wait before resending
                      </>
                    ) : (
                      'Send Another Email'
                    )}
                  </button>
                  
                  <Link href="/login" style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
