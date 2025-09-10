'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EnhancedReviewForm from '@/components/EnhancedReviewForm'
import { Star, Filter, Play, Quote, CheckCircle, Users, Download, Clock, DollarSign, Plus, X } from 'lucide-react'

interface Review {
  id: string
  name: string
  role: string
  industry: string
  rating: number
  title: string
  content: string
  date: string
  verified: boolean
  helpful: number
  avatar?: string
  metrics?: {
    downloadsSaved: number
    timeSaved: string
    moneySaved: number
  }
}

export default function ReviewsPage() {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  // Removed filters for cleaner design
  const [isLoading, setIsLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStarReviews: 0
  })

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews')
        if (response.ok) {
          const data = await response.json()
          setReviews(data.reviews)
          setFilteredReviews(data.reviews)
          setStats(data.stats)
        } else {
          // Fallback to mock data if API fails
          const mockReviews: Review[] = [
            {
              id: '1',
              name: 'Sarah M.',
              role: 'Creative Director',
              industry: 'Marketing Agency',
              rating: 5,
              title: 'Game-changer for our creative workflow',
              content: 'StockMedia Pro has revolutionized how we source visual content. The quality is exceptional and the licensing is crystal clear. We\'ve saved thousands of hours and significantly reduced our content costs.',
              date: '2024-12-01',
              verified: true,
              helpful: 24,
              metrics: {
                downloadsSaved: 150,
                timeSaved: '40 hours/week',
                moneySaved: 2500
              }
            },
            {
              id: '2',
              name: 'Michael R.',
              role: 'Freelance Designer',
              industry: 'Design',
              rating: 5,
              title: 'Perfect for independent creators',
              content: 'As a solo designer, I need reliable access to high-quality stock media. StockMedia Pro delivers exactly that with transparent pricing and no hidden fees. The API integration is seamless.',
              date: '2024-11-28',
              verified: true,
              helpful: 18,
              metrics: {
                downloadsSaved: 75,
                timeSaved: '15 hours/week',
                moneySaved: 1200
              }
            },
            {
              id: '3',
              name: 'Jennifer L.',
              role: 'Content Manager',
              industry: 'E-commerce',
              rating: 4,
              title: 'Great value and quality',
              content: 'The variety of content is impressive, and the search functionality makes it easy to find exactly what we need. Customer support is responsive and helpful.',
              date: '2024-11-25',
              verified: true,
              helpful: 12,
              metrics: {
                downloadsSaved: 200,
                timeSaved: '25 hours/week',
                moneySaved: 1800
              }
            },
            {
              id: '4',
              name: 'David K.',
              role: 'Marketing Manager',
              industry: 'Technology',
              rating: 5,
              title: 'Exceeded expectations',
              content: 'We switched from multiple stock photo services to StockMedia Pro and couldn\'t be happier. The unified platform saves us time and money while providing better quality content.',
              date: '2024-11-20',
              verified: true,
              helpful: 31,
              metrics: {
                downloadsSaved: 300,
                timeSaved: '50 hours/week',
                moneySaved: 4000
              }
            }
          ]
          setReviews(mockReviews)
          setFilteredReviews(mockReviews)
          setStats({
            averageRating: 4.8,
            totalReviews: mockReviews.length,
            fiveStarReviews: mockReviews.filter(r => r.rating === 5).length
          })
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // Sort reviews by most recent date
  useEffect(() => {
    const sortedReviews = [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setFilteredReviews(sortedReviews)
  }, [reviews])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? '#fbbf24' : '#e5e7eb'}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
      />
    ))
  }

  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    // Refresh reviews
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>Loading reviews...</p>
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
      <Header variant="home" />

      {/* Hero Section */}
      <section style={{
        padding: '80px 0',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 48px)',
            fontWeight: 'bold',
            marginBottom: '24px'
          }}>
            What Our Customers Say
          </h1>
          <p style={{
            fontSize: '20px',
            marginBottom: '48px',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            Join thousands of satisfied customers who trust StockMedia Pro for their creative needs
          </p>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            marginBottom: '48px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                {stats.averageRating.toFixed(1)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>Average Rating</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                {stats.totalReviews}+
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>Verified Reviews</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                {stats.fiveStarReviews}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>5-Star Reviews</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                98%
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>Would Recommend</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register">
              <button style={{
                padding: '16px 32px',
                background: 'white',
                color: '#2563eb',
                fontSize: '18px',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                Start Your Free Trial
              </button>
            </Link>
            {session && (
              <button
                onClick={() => setShowReviewForm(true)}
                style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '2px solid white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={20} />
                Write a Review
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={{
        padding: '48px 0',
        background: 'white',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            Share Your Experience
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Help others discover the value of StockMedia Pro by sharing your story
          </p>
          {session ? (
            <button
              onClick={() => setShowReviewForm(true)}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '0 auto',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Plus size={20} />
              Write a Review
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login">
                <button style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  Sign In to Review
                </button>
              </Link>
              <Link href="/register">
                <button style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  color: '#2563eb',
                  fontSize: '18px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: '2px solid #2563eb',
                  cursor: 'pointer'
                }}>
                  Create Account
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Grid */}
      <section style={{ padding: '64px 0' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px',
            marginBottom: '64px'
          }}>
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                style={{
                  background: 'white',
                  padding: '32px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0'
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#1d4ed8'
                    }}>
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>
                          {review.name}
                        </span>
                        {review.verified && (
                          <CheckCircle size={16} style={{ color: '#10b981' }} />
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        {review.role} • {review.industry}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      {renderStars(review.rating)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {review.date}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  {review.title}
                </h3>
                <p style={{
                  color: '#374151',
                  lineHeight: '1.6',
                  marginBottom: '20px'
                }}>
                  {review.content}
                </p>

                {/* Metrics */}
                {review.metrics && (
                  <div style={{
                    display: 'flex',
                    gap: '24px',
                    marginBottom: '20px',
                    padding: '16px',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Download size={16} style={{ color: '#10b981' }} />
                      <span style={{ fontSize: '14px', color: '#64748b' }}>
                        {review.metrics.downloadsSaved} downloads
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} style={{ color: '#3b82f6' }} />
                      <span style={{ fontSize: '14px', color: '#64748b' }}>
                        {review.metrics.timeSaved} saved
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={16} style={{ color: '#f59e0b' }} />
                      <span style={{ fontSize: '14px', color: '#64748b' }}>
                        ${review.metrics.moneySaved} saved
                      </span>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    <span>Helpful</span>
                    <span style={{ fontWeight: '600' }}>({review.helpful})</span>
                  </button>
                  {review.verified && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#10b981',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      <CheckCircle size={14} />
                      <span>Verified Purchase</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            padding: '48px',
            borderRadius: '12px',
            textAlign: 'center',
            color: 'white'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              Ready to Join Our Satisfied Customers?
            </h2>
            <p style={{
              fontSize: '18px',
              marginBottom: '32px',
              opacity: 0.9
            }}>
              Start your free trial today and experience the difference StockMedia Pro can make for your creative projects.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register">
                <button style={{
                  padding: '16px 32px',
                  background: 'white',
                  color: '#2563eb',
                  fontSize: '18px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Start Free Trial
                </button>
              </Link>
              <Link href="/contact">
                <button style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '2px solid white',
                  cursor: 'pointer'
                }}>
                  Contact Sales
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="home" />

      {/* Review Form Modal */}
      {showReviewForm && (
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
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
            width: '100%',
            maxWidth: '600px'
          }}>
            <button
              onClick={() => setShowReviewForm(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              <X size={20} />
            </button>
            <EnhancedReviewForm
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewForm(false)}
            />
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
