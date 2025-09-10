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
  Zap
} from 'lucide-react'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import FacebookSignInButton from '@/components/FacebookSignInButton'

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
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          width: '100%',
          maxWidth: '400px',
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
          
          @media (max-width: 768px) {
            .login-container {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
              padding: 20px !important;
            }
            
            .login-container > div:first-child {
              display: none !important;
            }
            
            .login-container > div:last-child {
              max-width: 100% !important;
              padding: 32px 24px !important;
            }
          }
          
          @media (max-width: 480px) {
            .login-container > div:last-child {
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
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          maxWidth: '1200px',
          width: '100%',
          alignItems: 'center',
          zIndex: 1
        }}
        className="login-container"
        >
          {/* Left Side - Branding & Features */}
          <div style={{
            color: 'white',
            animation: 'slideInRight 0.8s ease-out'
          }}>
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>SM</span>
                </div>
                <span style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  StockMedia Pro
                </span>
              </div>
              <h1 style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '16px',
                lineHeight: '1.2'
              }}>
                Welcome Back
              </h1>
              <p style={{
                fontSize: '20px',
                opacity: 0.9,
                marginBottom: '40px',
                lineHeight: '1.6'
              }}>
                Access millions of premium stock photos, videos, and graphics from 500+ top sites worldwide.
              </p>
            </div>

            {/* Features */}
            <div style={{
              display: 'grid',
              gap: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Zap size={20} color="white" />
                <span>Instant downloads with commercial licensing</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Shield size={20} color="white" />
                <span>Secure, encrypted transactions</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Users size={20} color="white" />
                <span>Join 10,000+ satisfied creators</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'fadeInUp 0.8s ease-out',
            maxWidth: '400px',
            width: '100%'
          }}>
            {/* Form Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                Sign In
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '16px'
              }}>
                Enter your credentials to access your account
              </p>
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
                    placeholder="Enter your email"
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

              {/* Password Field */}
              <div>
                <label htmlFor="password" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Password
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
                    placeholder="Enter your password"
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

              {/* Remember Me & Forgot Password */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#3b82f6'
                    }}
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Forgot password?
                </Link>
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
                  borderRadius: '12px',
                  marginBottom: '8px'
                }}>
                  <AlertCircle size={20} color="#dc2626" />
                  <p style={{ color: '#dc2626', margin: 0, fontSize: '14px' }}>{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isValidating}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: isLoading || isValidating 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading || isValidating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isLoading || isValidating 
                    ? 'none' 
                    : '0 4px 14px 0 rgba(59, 130, 246, 0.3)',
                  transform: isLoading || isValidating ? 'none' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !isValidating) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(59, 130, 246, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && !isValidating) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(59, 130, 246, 0.3)'
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Signing In...
                  </>
                ) : isValidating ? (
                  <>
                    <CheckCircle size={20} />
                    Success! Redirecting...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div style={{
              marginTop: '32px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '0 0 16px 0'
              }}>
                Don't have an account?{' '}
                <Link href="/register" style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Sign up here
                </Link>
              </p>
              
              {/* Social Login Options */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '20px'
              }}>
                <div style={{
                  position: 'relative',
                  textAlign: 'center',
                  margin: '16px 0'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: '#e5e7eb'
                  }}></div>
                  <span style={{
                    background: 'white',
                    padding: '0 16px',
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    Or continue with
                  </span>
                </div>
                
                <GoogleSignInButton 
                  text="Continue with Google"
                  onSuccess={() => {
                    console.log('Google sign-in successful')
                  }}
                  onError={(error) => {
                    console.error('Google sign-in error:', error)
                  }}
                />
                
                <FacebookSignInButton 
                  text="Continue with Facebook"
                  onSuccess={() => {
                    console.log('Facebook sign-in successful')
                  }}
                  onError={(error) => {
                    console.error('Facebook sign-in error:', error)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}