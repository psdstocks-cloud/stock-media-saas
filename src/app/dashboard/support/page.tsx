'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Send, MessageCircle, Mail, Phone, Clock } from 'lucide-react'

export default function SupportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    message: '',
    priority: 'medium',
    attachments: [] as File[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...files]
    })
  }

  const removeAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index)
    })
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
        zIndex: 40
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <button
                onClick={() => router.back()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Support Center</h1>
            </div>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 1rem'
      }}>
        {submitted ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
              fontSize: '32px'
            }}>
              ✓
            </div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '16px'
            }}>
              Ticket Submitted Successfully!
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px auto'
            }}>
              We've received your support request and will get back to you within 24 hours.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Submit Another Ticket
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#374151',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '32px'
          }}>
            {/* Main Content */}
            <div>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  Submit a Support Ticket
                </h2>
                <p style={{
                  color: '#64748b',
                  marginBottom: '32px'
                }}>
                  Describe your issue and we'll help you resolve it quickly.
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your issue"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.2s ease'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: 'white'
                      }}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="download">Download Problems</option>
                      <option value="account">Account Issues</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: 'white'
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please provide detailed information about your issue..."
                      required
                      rows={6}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        resize: 'vertical',
                        minHeight: '120px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Attach Files (Optional)
                    </label>
                    <p style={{
                      fontSize: '12px',
                      color: '#64748b',
                      margin: '0 0 12px 0'
                    }}>
                      Upload screenshots, videos, or documents to help us understand your issue better. Max 10MB per file.
                    </p>
                    
                    <div style={{
                      border: '2px dashed #d1d5db',
                      borderRadius: '8px',
                      padding: '20px',
                      textAlign: 'center',
                      background: '#f9fafb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb'
                      e.currentTarget.style.background = '#f0f9ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db'
                      e.currentTarget.style.background = '#f9fafb'
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📎</div>
                      <p style={{
                        fontSize: '14px',
                        color: '#374151',
                        margin: '0 0 4px 0'
                      }}>
                        Click to upload files or drag and drop
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#64748b',
                        margin: 0
                      }}>
                        PNG, JPG, MP4, PDF up to 10MB each
                      </p>
                    </div>
                    
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />

                    {formData.attachments.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <h5 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          margin: '0 0 8px 0'
                        }}>
                          Attached Files ({formData.attachments.length})
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {formData.attachments.map((file, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background: '#f3f4f6',
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  width: '24px',
                                  height: '24px',
                                  background: '#dbeafe',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px'
                                }}>
                                  {file.type.startsWith('image/') ? '🖼️' : 
                                   file.type.startsWith('video/') ? '🎥' : '📄'}
                                </div>
                                <div>
                                  <p style={{
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    margin: 0
                                  }}>
                                    {file.name}
                                  </p>
                                  <p style={{
                                    fontSize: '10px',
                                    color: '#6b7280',
                                    margin: 0
                                  }}>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid #ffffff',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <MessageCircle size={20} />
                  Contact Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#dbeafe',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Mail size={20} color="#2563eb" />
                    </div>
                    <div>
                      <p style={{
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: 0,
                        fontSize: '14px'
                      }}>Email Support</p>
                      <p style={{
                        color: '#64748b',
                        margin: 0,
                        fontSize: '12px'
                      }}>support@stockmediasaas.com</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#dcfce7',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Phone size={20} color="#059669" />
                    </div>
                    <div>
                      <p style={{
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: 0,
                        fontSize: '14px'
                      }}>Phone Support</p>
                      <p style={{
                        color: '#64748b',
                        margin: 0,
                        fontSize: '12px'
                      }}>+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#fef3c7',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Clock size={20} color="#d97706" />
                    </div>
                    <div>
                      <p style={{
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: 0,
                        fontSize: '14px'
                      }}>Response Time</p>
                      <p style={{
                        color: '#64748b',
                        margin: 0,
                        fontSize: '12px'
                      }}>Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  FAQ
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <p style={{
                      fontWeight: '600',
                      color: '#0f172a',
                      margin: '0 0 4px 0',
                      fontSize: '14px'
                    }}>How long does it take to process an order?</p>
                    <p style={{
                      color: '#64748b',
                      margin: 0,
                      fontSize: '12px'
                    }}>Most orders are processed within 5-10 minutes.</p>
                  </div>
                  <div>
                    <p style={{
                      fontWeight: '600',
                      color: '#0f172a',
                      margin: '0 0 4px 0',
                      fontSize: '14px'
                    }}>Can I download the same file multiple times?</p>
                    <p style={{
                      color: '#64748b',
                      margin: 0,
                      fontSize: '12px'
                    }}>Yes, once you've ordered a file, you can download it unlimited times.</p>
                  </div>
                  <div>
                    <p style={{
                      fontWeight: '600',
                      color: '#0f172a',
                      margin: '0 0 4px 0',
                      fontSize: '14px'
                    }}>What file formats are supported?</p>
                    <p style={{
                      color: '#64748b',
                      margin: 0,
                      fontSize: '12px'
                    }}>We support JPG, PNG, MP4, MOV, and more.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
