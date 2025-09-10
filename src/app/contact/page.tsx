'use client'

import { useState } from 'react'
import Link from 'next/link'
import { contactSchema, sanitizeString } from '@/lib/validation'
import { useCSRFForm } from '@/hooks/useCSRF'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { csrfToken, isLoading: csrfLoading, error: csrfError, getHeaders } = useCSRFForm()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: sanitizeString(value)
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate form data
      const validatedData = contactSchema.parse(formData)
      
      // Check CSRF token
      if (!csrfToken) {
        throw new Error('CSRF token not available')
      }
      
      // Submit with CSRF protection
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...validatedData,
          _csrf: csrfToken
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      
      setIsSubmitted(true)
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message
        })
        setErrors(newErrors)
      } else {
        setErrors({ general: error.message || 'An error occurred' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          margin: '0 1rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '24px'
          }}>
            ✓
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            Message Sent!
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            marginBottom: '32px'
          }}>
            Thank you for reaching out. We'll get back to you within 24 hours.
          </p>
          <Link href="/">
            <button style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}>
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50
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
            height: '64px'
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href="/login">
                <button style={{
                  padding: '8px 16px',
                  color: '#64748b',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}>Sign In</button>
              </Link>
              <Link href="/register">
                <button style={{
                  padding: '8px 24px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}>Get Started</button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '80px 0' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 48px)',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '24px'
            }}>
              Contact Us
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#64748b',
              lineHeight: '1.6'
            }}>
              Have a question or need help? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '64px',
            alignItems: 'start'
          }}>
            {/* Contact Form */}
            <div style={{
              background: 'white',
              padding: '48px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '32px'
              }}>
                Send us a message
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors.name ? '#ef4444' : '#cbd5e1'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors.email ? '#ef4444' : '#cbd5e1'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors.subject ? '#ef4444' : '#cbd5e1'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    placeholder="What's this about?"
                  />
                  {errors.subject && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors.message ? '#ef4444' : '#cbd5e1'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      resize: 'vertical'
                    }}
                    placeholder="Tell us how we can help..."
                  />
                  {errors.message && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: isSubmitting 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <div style={{
                background: 'white',
                padding: '48px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                marginBottom: '32px'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '24px'
                }}>
                  Get in touch
                </h3>
                
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      📧
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#0f172a' }}>Email</div>
                      <div style={{ color: '#64748b' }}>support@stockmediapro.com</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      💬
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#0f172a' }}>Live Chat</div>
                      <div style={{ color: '#64748b' }}>Available 24/7</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ⏰
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#0f172a' }}>Response Time</div>
                      <div style={{ color: '#64748b' }}>Within 24 hours</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                padding: '32px',
                borderRadius: '12px',
                color: 'white',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '16px'
                }}>
                  Need immediate help?
                </h3>
                <p style={{
                  marginBottom: '24px',
                  opacity: 0.9
                }}>
                  Check out our comprehensive help center for instant answers to common questions.
                </p>
                <Link href="/dashboard/support">
                  <button style={{
                    padding: '12px 24px',
                    background: 'white',
                    color: '#2563eb',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Visit Help Center
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
