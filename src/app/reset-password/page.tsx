'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  Shield,
  Key
} from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [token, setToken] = useState('')
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [tokenError, setTokenError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get token from URL
  useEffect(() => {
    if (mounted) {
      const tokenParam = searchParams.get('token')
      if (tokenParam) {
        setToken(tokenParam)
        validateToken(tokenParam)
      } else {
        setTokenError('Invalid or missing reset token')
        setIsValidatingToken(false)
      }
    }
  }, [mounted, searchParams])

  // Validate token
  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`/api/validate-reset-token?token=${token}`)
      const data = await response.json()
      
      if (!response.ok) {
        setTokenError(data.error || 'Invalid or expired reset token')
      }
    } catch (error) {
      setTokenError('Failed to validate reset token')
    } finally {
      setIsValidatingToken(false)
    }
  }

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  }

  // Real-time validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    
    const validation = validatePassword(value)
    if (value && !validation.isValid) {
      setPasswordError('Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters')
    } else {
      setPasswordError('')
    }

    // Also validate confirm password
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
    } else if (confirmPassword && value === confirmPassword) {
      setConfirmPasswordError('')
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    
    if (value && password !== value) {
      setConfirmPasswordError('Passwords do not match')
    } else {
      setConfirmPasswordError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mounted || !token) return
    
    // Clear previous errors
    setError('')
    setPasswordError('')
    setConfirmPasswordError('')

    // Validate form
    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setPasswordError('Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters')
      return
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return
    }
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password,
          confirmPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'An error occurred. Please try again.')
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

  // Show loading while validating token
  if (isValidatingToken) {
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
          <p style={{ color: '#64748b', margin: 0 }}>Validating reset token...</p>
        </div>
      </div>
    )
  }

  // Show error if token is invalid
  if (tokenError) {
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
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <AlertCircle size={32} color="white" />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            Invalid Reset Link
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            {tokenError}
          </p>
          <Link href="/forgot-password" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
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
            Request New Reset Link
          </Link>
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
          @keyframes checkmark {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .reset-password-container {
              padding: 20px !important;
            }
            
            .reset-password-form {
              padding: 32px 24px !important;
            }
          }
          
          @media (max-width: 480px) {
            .reset-password-form {
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
        
        <div className="reset-password-container" style={{
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
          <div className="reset-password-form" style={{
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
                    <Key size={32} color="white" />
                  </div>
                  <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#0f172a',
                    marginBottom: '8px'
                  }}>
                    Create New Password
                  </h1>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    Enter a strong password to secure your account
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
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1e40af'
                    }}>
                      Password Requirements
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      At least 8 characters with uppercase, lowercase, numbers, and special characters
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  {/* New Password Field */}
                  <div>
                    <label htmlFor="password" style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: passwordError ? '#dc2626' : '#9ca3af',
                        zIndex: 1
                      }}>
                        <Lock size={20} />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={handlePasswordChange}
                        style={{
                          width: '100%',
                          padding: '16px 48px 16px 48px',
                          border: `2px solid ${passwordError ? '#dc2626' : password ? '#10b981' : '#e5e7eb'}`,
                          borderRadius: '12px',
                          fontSize: '16px',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                          background: 'white',
                          outline: 'none'
                        }}
                        placeholder="Enter your new password"
                        onFocus={(e) => {
                          e.target.style.borderColor = passwordError ? '#dc2626' : '#3b82f6'
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = passwordError ? '#dc2626' : password ? '#10b981' : '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {passwordError && (
                      <p style={{
                        color: '#dc2626',
                        fontSize: '14px',
                        margin: '8px 0 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <AlertCircle size={16} />
                        {passwordError}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: confirmPasswordError ? '#dc2626' : '#9ca3af',
                        zIndex: 1
                      }}>
                        <Lock size={20} />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        style={{
                          width: '100%',
                          padding: '16px 48px 16px 48px',
                          border: `2px solid ${confirmPasswordError ? '#dc2626' : confirmPassword ? '#10b981' : '#e5e7eb'}`,
                          borderRadius: '12px',
                          fontSize: '16px',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                          background: 'white',
                          outline: 'none'
                        }}
                        placeholder="Confirm your new password"
                        onFocus={(e) => {
                          e.target.style.borderColor = confirmPasswordError ? '#dc2626' : '#3b82f6'
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = confirmPasswordError ? '#dc2626' : confirmPassword ? '#10b981' : '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {confirmPasswordError && (
                      <p style={{
                        color: '#dc2626',
                        fontSize: '14px',
                        margin: '8px 0 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <AlertCircle size={16} />
                        {confirmPasswordError}
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
                      <p style={{ color: '#dc2626', margin: 0, fontSize: '14px' }}>{error}</p>
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
                        Updating Password...
                      </>
                    ) : (
                      <>
                        Update Password
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
                  Password Updated!
                </h1>
                <p style={{
                  color: '#64748b',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginBottom: '32px'
                }}>
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
                
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '32px'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#065f46',
                    fontWeight: '500'
                  }}>
                    Redirecting to login page in 3 seconds...
                  </p>
                </div>

                <Link href="/login" style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
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
                  Sign In Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
