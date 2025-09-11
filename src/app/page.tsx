import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SearchBarWrapper } from '@/components/SearchBarWrapper'
import { Button } from '@/components/ui/Button'
import { DashboardPreviewWrapper } from '@/components/DashboardPreviewWrapper'
import { SecurityBadges } from '@/components/ui/SecurityBadges'
import { TeamSection } from '@/components/ui/TeamSection'
import { PressSection } from '@/components/ui/PressSection'
import { ContactInfo } from '@/components/ui/ContactInfo'

export default async function HomePage() {
  // Handle database connection gracefully during build time
  let plans = []
  
  // Check if we're in build mode or if database is available
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('postgresql://')
  
  if (isBuildTime) {
    console.log('Build time detected, using fallback data')
    // Fallback data for build time
    plans = [
      {
        id: '1',
        name: 'Starter',
        price: 9.99,
        points: 100,
        isActive: true,
        rolloverLimit: 50,
        description: 'Perfect for getting started',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2', 
        name: 'Pro',
        price: 29.99,
        points: 500,
        isActive: true,
        rolloverLimit: 75,
        description: 'Great for growing businesses',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Enterprise',
        price: 99.99,
        points: 2000,
        isActive: true,
        rolloverLimit: 100,
        description: 'For large organizations',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  } else {
    try {
      plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      })
    } catch (error) {
      console.log('Database not available, using fallback data')
      // Fallback data for runtime errors
      plans = [
        {
          id: '1',
          name: 'Starter',
          price: 9.99,
          points: 100,
          isActive: true,
          rolloverLimit: 50,
          description: 'Perfect for getting started',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2', 
          name: 'Pro',
          price: 29.99,
          points: 500,
          isActive: true,
          rolloverLimit: 75,
          description: 'Great for growing businesses',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Enterprise',
          price: 99.99,
          points: 2000,
          isActive: true,
          rolloverLimit: 100,
          description: 'For large organizations',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* Header */}
      <Header variant="home" />

      {/* Hero Section - Modern 2024 Design */}
      <section className="section-padding-lg relative overflow-hidden">
        {/* Modern Background with Glassmorphism */}
        <div className="absolute inset-0 opacity-10" style={{
          background: 'var(--brand-gradient)'
        }} />
        
        {/* Floating Glass Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 glass-card animate-pulse" style={{
          borderRadius: '50%',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-backdrop)'
        }} />
        <div className="absolute top-40 right-20 w-24 h-24 glass-card animate-pulse" style={{
          borderRadius: '30%',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-backdrop)',
          animationDelay: '1s'
        }} />
        <div className="absolute bottom-20 left-1/4 w-20 h-20 glass-card animate-pulse" style={{
          borderRadius: '40%',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-backdrop)',
          animationDelay: '2s'
        }} />
        
        {/* Hero Content */}
        <div className="container-modern relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Modern Badge */}
            <div className="inline-flex items-center glass-button animate-fade-in-down mb-6">
              <span className="text-sm font-semibold text-white">
                🚀 New: AI-Powered Search & 10M+ Premium Assets
              </span>
            </div>
            
            {/* Modern Typography */}
            <h1 className="text-display-2xl mb-6 animate-fade-in-up">
              The Ultimate{' '}
              <span className="text-gradient">
                Stock Media
              </span>
              <br />
              Platform
            </h1>
            
            <p className="text-body-lg text-secondary-600 mb-8 max-w-3xl mx-auto animate-fade-in-up animate-stagger-1">
              Access millions of premium stock photos, videos, and graphics from 500+ top sites worldwide. 
              Download instantly with our point-based system and commercial licensing.
            </p>
            
            {/* Modern Search Bar */}
            <div className="max-w-2xl mx-auto mb-12 animate-fade-in-up animate-stagger-2">
              <SearchBarWrapper 
                placeholder="Search millions of stock photos, videos, and graphics..."
                showSuggestions={true}
              />
            </div>

            {/* Modern CTAs with 2024 Design */}
            <div className="flex-modern-col items-center justify-center space-y-4 mb-12 animate-fade-in-up animate-stagger-3">
              <div className="flex-modern-wrap items-center justify-center">
                <Link href="/register">
                  <button className="btn-modern btn-modern-lg btn-modern-primary btn-shine btn-glow hover-lift">
                    🚀 Start Free Trial - No Credit Card
                  </button>
                </Link>
                
                <button className="btn-modern btn-modern-lg btn-modern-outline hover-lift">
                  ▶️ Watch 2-Min Demo
                </button>
              </div>
              
              {/* Modern Trust Indicators */}
              <div className="flex-modern-wrap items-center justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2 text-success-600 text-sm font-medium">
                  <span>✓</span>
                  <span>Free 7-day trial</span>
                </div>
                <div className="flex items-center space-x-2 text-success-600 text-sm font-medium">
                  <span>✓</span>
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center space-x-2 text-success-600 text-sm font-medium">
                  <span>✓</span>
                  <span>Commercial license included</span>
                </div>
              </div>

              {/* Security Badges */}
              <div className="mt-6">
                <SecurityBadges variant="compact" />
              </div>
            </div>

            {/* Modern Stats Grid */}
            <div className="grid-modern max-w-2xl mx-auto animate-fade-in-up animate-stagger-4">
              <div className="text-center card-modern p-6 hover-lift">
                <div className="text-4xl font-bold text-secondary-900 mb-2">10M+</div>
                <div className="text-secondary-600 font-medium">Premium Assets</div>
              </div>
              <div className="text-center card-modern p-6 hover-lift">
                <div className="text-4xl font-bold text-secondary-900 mb-2">500+</div>
                <div className="text-secondary-600 font-medium">Stock Sites</div>
              </div>
              <div className="text-center card-modern p-6 hover-lift">
                <div className="text-4xl font-bold text-secondary-900 mb-2">50K+</div>
                <div className="text-secondary-600 font-medium">Happy Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Content Preview Section */}
        <div className="card-modern-elevated max-w-5xl mx-auto mt-20 p-10 relative z-10 animate-fade-in-up">
          <div className="text-center mb-8">
            <h3 className="text-display-lg mb-3">
              See What You Get
            </h3>
            <p className="text-body-lg text-secondary-600">
              Preview of premium content available on our platform
            </p>
          </div>
          
          {/* Modern Content Grid Preview */}
          <div className="grid-masonry">
            {[
              {
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
                title: 'Nature Landscapes',
                site: 'Unsplash',
                cost: 'Free'
              },
              {
                image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=200&fit=crop',
                title: 'Business Meeting',
                site: 'Pexels',
                cost: '3 pts'
              },
              {
                image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop',
                title: 'Technology Abstract',
                site: 'Pixabay',
                cost: '2 pts'
              },
              {
                image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
                title: 'Creative Design',
                site: 'Freepik',
                cost: '5 pts'
              }
            ].map((item, index) => (
              <div key={index} className="card-modern-interactive hover-lift animate-fade-in-up" style={{
                animationDelay: `${index * 0.1}s`
              }}>
                <div className="relative h-40 bg-cover bg-center" style={{
                  backgroundImage: `url(${item.image})`
                }}>
                  <div className="absolute top-2 right-2 glass-button text-xs">
                    {item.cost}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-secondary-900 mb-1 truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-secondary-600 capitalize">
                    {item.site}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Link href="/dashboard/browse">
              <button className="btn-modern btn-modern-md btn-modern-primary btn-shine hover-lift">
                Browse All Content →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Social Proof Section */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h3 style={{
              fontSize: 'clamp(28px, 5vw, 36px)',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px'
            }}>
              Trusted by 50,000+ Creators Worldwide
            </h3>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Join designers, marketers, and content creators from top companies who trust StockMedia Pro
            </p>
          </div>
          
          {/* Company Logos */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '48px',
            marginBottom: '64px',
            opacity: '0.7'
          }}>
            {[
              { name: 'Adobe', logo: '🎨' },
              { name: 'Figma', logo: '🎯' },
              { name: 'Canva', logo: '✨' },
              { name: 'Notion', logo: '📝' },
              { name: 'Slack', logo: '💬' },
              { name: 'Spotify', logo: '🎵' }
            ].map((company) => (
              <div key={company.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#64748b',
                padding: '8px 16px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{ fontSize: '20px' }}>{company.logo}</span>
                {company.name}
              </div>
            ))}
          </div>

          {/* Enhanced Testimonials */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {[
              {
                name: 'Sarah Johnson',
                role: 'Creative Director',
                company: 'Design Studio',
                avatar: '👩‍💼',
                content: 'StockMedia Pro has completely transformed our creative workflow. The AI-powered search finds exactly what we need in seconds, and the quality is consistently outstanding. We\'ve saved 15+ hours per week!',
                rating: 5,
                stats: 'Saved 15+ hours/week'
              },
              {
                name: 'Mike Chen',
                role: 'Marketing Manager',
                company: 'Tech Startup',
                avatar: '👨‍💻',
                content: 'The instant downloads and commercial licensing have been game-changers for our marketing campaigns. No more worrying about copyright issues, and the point system is incredibly cost-effective.',
                rating: 5,
                stats: '50% cost reduction'
              },
              {
                name: 'Emily Rodriguez',
                role: 'Freelance Designer',
                company: 'Independent',
                avatar: '👩‍🎨',
                content: 'As a freelancer, this platform has been my secret weapon. The variety of content is incredible, and the commercial licensing gives me complete peace of mind for client work.',
                rating: 5,
                stats: '100+ projects completed'
              },
              {
                name: 'David Kim',
                role: 'Content Creator',
                company: 'Social Media Agency',
                avatar: '👨‍🎬',
                content: 'The video content library is phenomenal. High-quality footage that would normally cost hundreds per clip. The search filters make finding the perfect shot incredibly easy.',
                rating: 5,
                stats: '500+ videos downloaded'
              },
              {
                name: 'Lisa Thompson',
                role: 'Brand Manager',
                company: 'E-commerce',
                avatar: '👩‍💼',
                content: 'We use StockMedia Pro for all our product photography and marketing materials. The consistency in quality and the ease of use has made our brand presentation so much more professional.',
                rating: 5,
                stats: '200% brand consistency'
              },
              {
                name: 'Alex Martinez',
                role: 'Web Developer',
                company: 'Digital Agency',
                avatar: '👨‍💻',
                content: 'The API integration is seamless, and the webhook notifications keep our workflow smooth. Our clients love the instant access to premium content without the usual licensing headaches.',
                rating: 5,
                stats: '99.9% uptime'
              }
            ].map((testimonial, index) => (
              <div key={index} style={{
                padding: '32px',
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              >
                {/* Quote Icon */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  fontSize: '24px',
                  color: '#e2e8f0',
                  opacity: '0.5'
                }}>
                  &ldquo;
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '20px'
                }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} style={{ color: '#fbbf24', fontSize: '18px' }}>★</span>
                  ))}
                </div>
                
                <p style={{
                  color: '#374151',
                  lineHeight: '1.6',
                  marginBottom: '24px',
                  fontSize: '16px',
                  fontStyle: 'italic'
                }}>
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '2px',
                      fontSize: '16px'
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
                
                <div style={{
                  padding: '8px 12px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  {testimonial.stats}
                </div>
              </div>
            ))}
          </div>
          
          {/* Trust Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '32px',
            marginTop: '48px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{ color: '#10b981', fontSize: '20px' }}>🔒</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>SSL Secured</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{ color: '#10b981', fontSize: '20px' }}>⚡</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>99.9% Uptime</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{ color: '#10b981', fontSize: '20px' }}>🛡️</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>Commercial License</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Preview Section */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: 'clamp(32px, 6vw, 40px)',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px'
            }}>
              See the Platform in Action
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Get a preview of your dashboard and see how easy it is to manage your stock media library
            </p>
          </div>
          
          <DashboardPreviewWrapper />
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
              We&apos;ve built the most comprehensive stock media platform with features designed for modern creators and businesses.
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

      {/* Team & Company Story Section */}
      <section style={{
        padding: '80px 0',
        background: 'white'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <TeamSection variant="full" />
        </div>
      </section>

      {/* Press & Media Coverage Section */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <PressSection variant="full" />
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

      {/* Enhanced CTA Section */}
      <section style={{
        padding: '100px 0',
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        textAlign: 'center',
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
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Urgency Banner */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            🔥 Limited Time: 50% Off First Month - Ends Soon!
          </div>
          
          <h2 style={{
            fontSize: 'clamp(36px, 6vw, 48px)',
            fontWeight: '800',
            color: 'white',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            Ready to Transform Your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Creative Workflow?
            </span>
          </h2>
          
          <p style={{
            fontSize: '20px',
            color: '#bfdbfe',
            marginBottom: '40px',
            maxWidth: '768px',
            margin: '0 auto 40px',
            lineHeight: '1.6'
          }}>
            Join 50,000+ creators who have already discovered the power of StockMedia Pro. 
            Start your free trial today and experience the difference.
          </p>
          
          {/* Value Proposition Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            maxWidth: '800px',
            margin: '0 auto 48px'
          }}>
            {[
              { icon: '⚡', title: 'Instant Access', desc: 'Download immediately' },
              { icon: '🛡️', title: 'Commercial License', desc: 'Use anywhere, anytime' },
              { icon: '💰', title: 'Save 70%', desc: 'vs individual purchases' },
              { icon: '🎯', title: 'AI-Powered', desc: 'Find perfect content fast' }
            ].map((benefit, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  fontSize: '24px',
                  marginBottom: '8px'
                }}>
                  {benefit.icon}
                </div>
                <h3 style={{
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {benefit.title}
                </h3>
                <p style={{
                  color: '#bfdbfe',
                  fontSize: '14px'
                }}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
          
          {/* Enhanced CTAs */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '20px',
              flexWrap: 'wrap',
              justifyContent: 'center'
          }}>
            <Link href="/register">
                <Button 
                  style={{
                    padding: '20px 40px',
                background: 'white',
                color: '#2563eb',
                fontSize: '18px',
                    fontWeight: '700',
                    borderRadius: '12px',
                border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(0)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🚀 Start Free Trial - No Credit Card Required
                </Button>
            </Link>
              <Button 
                variant="outline"
                style={{
                  padding: '20px 40px',
                  border: '2px solid white',
              color: 'white',
              fontSize: '18px',
                  fontWeight: '600',
                  borderRadius: '12px',
              background: 'transparent',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                📞 Contact Sales Team
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginTop: '16px',
              fontSize: '14px',
              color: '#bfdbfe',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                <span>7-day free trial</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                <span>Cancel anytime</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                <span>24/7 support</span>
              </div>
            </div>
          </div>
          
          {/* Social Proof Numbers */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '48px',
            flexWrap: 'wrap',
            marginTop: '40px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>50K+</div>
              <div style={{ color: '#bfdbfe', fontSize: '14px' }}>Happy Users</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>10M+</div>
              <div style={{ color: '#bfdbfe', fontSize: '14px' }}>Downloads</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>4.9★</div>
              <div style={{ color: '#bfdbfe', fontSize: '14px' }}>User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="home" />
    </div>
  )
}