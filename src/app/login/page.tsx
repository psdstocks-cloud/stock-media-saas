'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        // Check if user is admin
        const session = await getSession()
        if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: '⚡',
      title: "Instant Access",
      description: "Access millions of premium stock media files instantly"
    },
    {
      icon: '🛡️',
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: '⭐',
      title: "Premium Quality",
      description: "High-quality content from 500+ top stock sites"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Creative Director",
      content: "StockMedia Pro has transformed our creative workflow completely.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Marketing Manager", 
      content: "The best investment we've made for our content strategy.",
      rating: 5
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
            <Link href="/register">
              <button style={{
                padding: '8px 16px',
                color: '#64748b',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
              }}>
                Sign Up
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}>
          {/* Login Form */}
          <div style={{
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                Welcome Back
              </h1>
              <p style={{
                color: '#64748b',
                fontSize: '16px'
              }}>
                Sign in to your account to continue
              </p>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: 'none',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '32px' }}>
                {message && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      color: '#16a34a'
                    }}>
                      ✓
                    </div>
                    <p style={{ color: '#16a34a', margin: 0 }}>{message}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
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
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter your email"
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
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 48px 12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'all 0.2s ease',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9ca3af',
                          fontSize: '16px'
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        style={{
                          width: '16px',
                          height: '16px',
                          marginRight: '8px',
                          accentColor: '#2563eb'
                        }}
                      />
                      <label htmlFor="remember-me" style={{
                        fontSize: '14px',
                        color: '#374151',
                        cursor: 'pointer'
                      }}>
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" style={{
                      fontSize: '14px',
                      color: '#2563eb',
                      textDecoration: 'none'
                    }}>
                      Forgot password?
                    </Link>
                  </div>

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

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
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
                    {isLoading ? 'Signing In...' : 'Sign In →'}
                  </button>
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
                    Don't have an account?{' '}
                    <Link href="/register" style={{
                      color: '#2563eb',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>
                      Sign up here
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
            <div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                Why Choose StockMedia Pro?
              </h2>
              <p style={{
                fontSize: '18px',
                color: '#64748b',
                marginBottom: '32px'
              }}>
                Join thousands of creators who trust us for their premium stock media needs.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {features.map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 style={{
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '4px'
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{
                      color: '#64748b',
                      margin: 0
                    }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{
                fontWeight: '600',
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
                {testimonials.map((testimonial, index) => (
                  <div key={index}>
                    <div style={{
                      display: 'flex',
                      gap: '4px',
                      marginBottom: '8px'
                    }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>
                      ))}
                    </div>
                    <p style={{
                      color: '#374151',
                      fontSize: '14px',
                      marginBottom: '4px',
                      margin: 0
                    }}>
                      "{testimonial.content}"
                    </p>
                    <p style={{
                      color: '#64748b',
                      fontSize: '12px',
                      margin: 0
                    }}>
                      - {testimonial.name}, {testimonial.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#dcfce7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  🛡️
                </div>
                <h3 style={{
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: 0
                }}>
                  Secure & Reliable
                </h3>
              </div>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                margin: 0
              }}>
                Your data is protected with enterprise-grade security and 99.9% uptime guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}