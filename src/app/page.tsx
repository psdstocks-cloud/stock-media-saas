import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default async function HomePage() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <Header variant="home" />

      {/* Hero Section */}
      <section style={{
        padding: '80px 0',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            maxWidth: '896px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: '9999px',
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '4px 12px',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '24px'
            }}>
              🚀 New: AI-Powered Search
            </div>
            <h1 style={{
              fontSize: 'clamp(48px, 8vw, 80px)',
              fontWeight: '800',
              color: '#0f172a',
              marginBottom: '24px',
              lineHeight: '1.1'
            }}>
              The Ultimate{' '}
              <span style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Stock Media
              </span>
              <br />
              Platform
          </h1>
            <p style={{
              fontSize: 'clamp(20px, 3vw, 24px)',
              color: '#64748b',
              marginBottom: '32px',
              lineHeight: '1.6',
              maxWidth: '768px',
              margin: '0 auto 32px'
            }}>
              Access millions of premium stock photos, videos, and graphics from 500+ top sites worldwide. 
              Download instantly with our point-based system and commercial licensing.
            </p>
            {/* Search Bar */}
            <div style={{
              maxWidth: '600px',
              margin: '0 auto 48px',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                border: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="text"
                  placeholder="Search millions of stock photos, videos, and graphics..."
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                    background: 'transparent'
                  }}
                />
                <button style={{
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🔍 Search
                </button>
              </div>
              {/* Popular Search Terms */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '16px',
                justifyContent: 'center'
              }}>
                {['nature', 'business', 'technology', 'people', 'abstract'].map((term) => (
                  <span
                    key={term}
                    style={{
                      padding: '4px 12px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#2563eb'
                      e.currentTarget.style.color = 'white'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'
                      e.currentTarget.style.color = '#64748b'
                    }}
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '48px'
            }}>
              <Link href="/register">
                <button style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  fontSize: '18px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.4)',
                  transition: 'all 0.3s ease'
                }}>Start Free Trial</button>
            </Link>
              <button style={{
                padding: '16px 32px',
                border: '1px solid #cbd5e1',
                color: '#374151',
                fontSize: '18px',
                borderRadius: '8px',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}>Watch Demo</button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '32px',
              maxWidth: '512px',
              margin: '0 auto'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>10M+</div>
                <div style={{ color: '#64748b', fontWeight: '500' }}>Media Files</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>500+</div>
                <div style={{ color: '#64748b', fontWeight: '500' }}>Stock Sites</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>50K+</div>
                <div style={{ color: '#64748b', fontWeight: '500' }}>Happy Users</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>99.9%</div>
                <div style={{ color: '#64748b', fontWeight: '500' }}>Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section style={{
        padding: '60px 0',
        background: 'white',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '16px'
            }}>
              Trusted by 50,000+ Creators Worldwide
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#64748b'
            }}>
              Join designers, marketers, and content creators from top companies
            </p>
          </div>
          
          {/* Company Logos */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '48px',
            marginBottom: '48px',
            opacity: '0.6'
          }}>
            {['Adobe', 'Figma', 'Canva', 'Notion', 'Slack', 'Spotify'].map((company) => (
              <div key={company} style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#64748b'
              }}>
                {company}
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {[
              {
                name: 'Sarah Johnson',
                role: 'Creative Director',
                company: 'Design Studio',
                content: 'StockMedia Pro has revolutionized our workflow. The AI search finds exactly what we need in seconds.',
                rating: 5
              },
              {
                name: 'Mike Chen',
                role: 'Marketing Manager',
                company: 'Tech Startup',
                content: 'The quality of content and instant downloads have saved us countless hours. Highly recommended!',
                rating: 5
              },
              {
                name: 'Emily Rodriguez',
                role: 'Freelance Designer',
                company: 'Independent',
                content: 'Best investment I\'ve made for my business. The commercial licensing gives me peace of mind.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} style={{
                padding: '24px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '16px'
                }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>
                  ))}
                </div>
                <p style={{
                  color: '#374151',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                  fontStyle: 'italic'
                }}>
                  "{testimonial.content}"
                </p>
                <div>
                  <div style={{
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '4px'
                  }}>
                    {testimonial.name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '80px 0',
        background: 'white'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: 'clamp(36px, 6vw, 48px)',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '24px'
            }}>
              Why Choose StockMedia Pro?
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#64748b',
              maxWidth: '768px',
              margin: '0 auto'
            }}>
              We've built the most comprehensive stock media platform with features designed for modern creators and businesses.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {[
              { icon: '🔍', title: 'Smart Search', desc: 'AI-powered search across millions of high-quality stock media files' },
              { icon: '⬇️', title: 'Instant Downloads', desc: 'Download your media files instantly with our high-speed CDN' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Optimized for speed with 99.9% uptime and global edge servers' },
              { icon: '🛡️', title: 'Commercial License', desc: 'Full commercial rights for all downloads with no attribution required' },
              { icon: '🌍', title: 'Global Access', desc: 'Access to premium stock sites worldwide in one unified platform' },
              { icon: '🕐', title: '24/7 Support', desc: 'Round-the-clock customer support from our expert team' }
            ].map((feature, index) => (
              <div key={index} style={{
                padding: '24px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '16px'
                }}>
                  {feature.icon}
              </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '12px'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: 'clamp(36px, 6vw, 48px)',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '24px'
            }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#64748b',
              maxWidth: '768px',
              margin: '0 auto'
            }}>
              Choose the plan that fits your needs. All plans include commercial licensing and instant downloads.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {plans.map((plan, index) => (
              <div key={plan.id} style={{
                padding: '32px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                ...(index === 1 && {
                  border: '2px solid #3b82f6',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  transform: 'scale(1.05)'
                })
              }}>
                {index === 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '-16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    padding: '4px 16px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                      Most Popular
                  </div>
                )}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#0f172a',
                    marginBottom: '8px',
                    textTransform: 'capitalize'
                  }}>
                    {plan.name}
                  </h3>
                  <p style={{
                    color: '#64748b',
                    fontSize: '18px'
                  }}>
                    {plan.name === 'starter' && 'Perfect for individuals and small projects'}
                    {plan.name === 'professional' && 'Ideal for freelancers and small agencies'}
                    {plan.name === 'business' && 'Perfect for agencies and design teams'}
                    {plan.name === 'enterprise' && 'For large agencies and enterprises'}
                  </p>
                  <div style={{ marginTop: '16px' }}>
                    <span style={{
                      fontSize: '36px',
                      fontWeight: 'bold',
                      color: '#0f172a'
                    }}>
                      ${plan.price}
                    </span>
                    <span style={{
                      color: '#64748b',
                      marginLeft: '8px'
                    }}>
                      /month
                    </span>
                  </div>
                    </div>
                <div>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 32px 0'
                  }}>
                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ width: '20px', height: '20px', color: '#10b981', marginRight: '12px' }}>✓</span>
                      <span style={{ color: '#374151' }}>{plan.points} points per month</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ width: '20px', height: '20px', color: '#10b981', marginRight: '12px' }}>✓</span>
                      <span style={{ color: '#374151' }}>{plan.rolloverLimit}% rollover limit</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ width: '20px', height: '20px', color: '#10b981', marginRight: '12px' }}>✓</span>
                      <span style={{ color: '#374151' }}>Commercial licensing</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ width: '20px', height: '20px', color: '#10b981', marginRight: '12px' }}>✓</span>
                      <span style={{ color: '#374151' }}>API access</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ width: '20px', height: '20px', color: '#10b981', marginRight: '12px' }}>✓</span>
                      <span style={{ color: '#374151' }}>24/7 support</span>
                    </li>
                  </ul>
                  <Link href="/register" style={{ width: '100%', display: 'block' }}>
                    <button style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      ...(index === 1 ? {
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: 'white'
                      } : {
                        border: '1px solid #cbd5e1',
                        color: '#374151',
                        background: 'transparent'
                      })
                    }}>
                    Get Started
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <h2 style={{
            fontSize: 'clamp(36px, 6vw, 48px)',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px'
          }}>
            Ready to Transform Your Creative Workflow?
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#bfdbfe',
            marginBottom: '32px',
            maxWidth: '768px',
            margin: '0 auto 32px'
          }}>
            Join thousands of creators who have already discovered the power of StockMedia Pro. 
            Start your free trial today and experience the difference.
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Link href="/register">
              <button style={{
                padding: '16px 32px',
                background: 'white',
                color: '#2563eb',
                fontSize: '18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}>Start Free Trial</button>
            </Link>
            <button style={{
              padding: '16px 32px',
              border: '1px solid white',
              color: 'white',
              fontSize: '18px',
              borderRadius: '8px',
              background: 'transparent',
              cursor: 'pointer'
            }}>Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="home" />
    </div>
  )
}