'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Star, Check, Zap, Shield, Users, Globe, Sparkles, TrendingUp, Award } from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #e0f2fe 100%)'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '12px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading StockMedia Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .fade-in-up { animation: fadeInUp 0.6s ease-out; }
        .float { animation: float 3s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-bg {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        }
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #e0f2fe 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Navigation */}
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
          padding: '0 1rem'
        }}>
          <div style={{ 
            maxWidth: '1280px', 
            margin: '0 auto', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: '64px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={20} color="white" />
              </div>
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                StockMedia Pro
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <Link href="/dashboard/download" style={{ color: '#6b7280', textDecoration: 'none' }}>Download</Link>
                <Link href="/pricing" style={{ color: '#6b7280', textDecoration: 'none' }}>Pricing</Link>
                <Link href="/about" style={{ color: '#6b7280', textDecoration: 'none' }}>About</Link>
                <Link href="/contact" style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</Link>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/login" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem' }}>Sign In</Link>
                <Link href="/register" style={{
                  padding: '0.5rem 1.5rem',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section style={{ 
          paddingTop: '8rem', 
          paddingBottom: '5rem', 
          paddingLeft: '1rem', 
          paddingRight: '1rem' 
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '3rem', 
              alignItems: 'center' 
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))',
                  borderRadius: '9999px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  width: 'fit-content'
                }}>
                  <Sparkles size={16} color="#8b5cf6" style={{ marginRight: '0.5rem' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#8b5cf6' }}>
                    AI-Powered Content Discovery
                  </span>
                </div>
                
                <h1 style={{ 
                  fontSize: '3.75rem', 
                  fontWeight: 'bold', 
                  color: '#111827', 
                  lineHeight: '1.1',
                  margin: 0
                }}>
                  The Future of<br />
                  <span className="gradient-text">Stock Media</span><br />
                  is Here
                </h1>
                
                <p style={{ 
                  fontSize: '1.25rem', 
                  color: '#6b7280', 
                  lineHeight: '1.6', 
                  maxWidth: '32rem' 
                }}>
                  Discover, license, and manage premium stock media with AI-powered search, 
                  real-time collaboration, and enterprise-grade security. Built for modern creative teams.
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link href="/register" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.3)'
                  }}>
                    Start Free Trial
                    <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                  </Link>
                  <button style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem 2rem',
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    borderRadius: '12px',
                    background: 'white',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}>
                    <Play size={20} style={{ marginRight: '0.5rem' }} />
                    Watch Demo
                  </button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '-0.5rem' }}>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          borderRadius: '50%',
                          border: '2px solid white',
                          marginLeft: i > 1 ? '-8px' : '0'
                        }}></div>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>10,000+ creators</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />
                    ))}
                    <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>4.9/5 rating</span>
                  </div>
                </div>
              </div>
              
              <div style={{ position: 'relative' }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                  borderRadius: '24px',
                  padding: '2rem',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  zIndex: 10
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '1rem' 
                  }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{
                        aspectRatio: '1',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          borderRadius: '8px'
                        }}></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Floating elements */}
                <div style={{
                  position: 'absolute',
                  top: '-1rem',
                  right: '-1rem',
                  width: '96px',
                  height: '96px',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  borderRadius: '50%',
                  opacity: 0.2,
                  animation: 'float 3s ease-in-out infinite'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-1rem',
                  left: '-1rem',
                  width: '128px',
                  height: '128px',
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  borderRadius: '50%',
                  opacity: 0.1,
                  animation: 'float 3s ease-in-out infinite 1s'
                }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Temporary Brand Color Test Blocks */}
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex gap-4">
            <div className="w-1/2 p-8 bg-primary text-primary-foreground rounded-lg">
              Primary Color (Purple)
            </div>
            <div className="w-1/2 p-8 bg-secondary text-secondary-foreground rounded-lg">
              Secondary Color (Orange)
            </div>
          </div>
        </section>
        {/* End of temporary test blocks */}

        {/* Stats Section */}
        <section style={{ 
          padding: '4rem 1rem', 
          background: 'rgba(248, 250, 252, 0.5)' 
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '2rem' 
            }}>
              {[
                { number: '2M+', label: 'High-Quality Assets' },
                { number: '500+', label: 'Premium Brands' },
                { number: '99.9%', label: 'Uptime SLA' },
                { number: '24/7', label: 'Support' }
              ].map((stat, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.5rem'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{ color: '#6b7280' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '5rem 1rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '1rem' 
              }}>
                Everything You Need to<br />
                <span style={{
                  background: 'linear-gradient(135deg, #f97316, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Scale Your Creative Work
                </span>
              </h2>
              <p style={{ 
                fontSize: '1.25rem', 
                color: '#6b7280', 
                maxWidth: '48rem', 
                margin: '0 auto' 
              }}>
                From AI-powered discovery to enterprise collaboration, we provide the tools 
                and infrastructure modern creative teams need to succeed.
              </p>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem' 
            }}>
              {[
                {
                  icon: Zap,
                  title: 'AI-Powered Search',
                  description: 'Find the perfect asset in seconds with our advanced AI that understands context and style.',
                  color: 'linear-gradient(135deg, #fbbf24, #f97316)'
                },
                {
                  icon: Shield,
                  title: 'Enterprise Security',
                  description: 'Bank-grade security with SOC 2 compliance, SSO, and advanced access controls.',
                  color: 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                },
                {
                  icon: Users,
                  title: 'Team Collaboration',
                  description: 'Real-time collaboration tools with role-based permissions and approval workflows.',
                  color: 'linear-gradient(135deg, #10b981, #059669)'
                },
                {
                  icon: Globe,
                  title: 'Global CDN',
                  description: 'Lightning-fast delivery worldwide with our edge-optimized content delivery network.',
                  color: 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                },
                {
                  icon: TrendingUp,
                  title: 'Analytics & Insights',
                  description: 'Comprehensive analytics to track usage, performance, and ROI across your team.',
                  color: 'linear-gradient(135deg, #6366f1, #3b82f6)'
                },
                {
                  icon: Award,
                  title: 'Premium Quality',
                  description: 'Curated collection of high-resolution, professional-grade assets from top creators.',
                  color: 'linear-gradient(135deg, #ef4444, #f97316)'
                }
              ].map((feature, index) => (
                <div key={index} className="hover-lift" style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #f3f4f6',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: feature.color,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <feature.icon size={24} color="white" />
                  </div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: '#111827', 
                    marginBottom: '0.75rem' 
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ 
          padding: '5rem 1rem', 
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
        }}>
          <div style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              color: 'white', 
              marginBottom: '1rem' 
            }}>
              Ready to Transform Your<br />
              <span style={{
                background: 'linear-gradient(135deg, #fbbf24, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Creative Workflow?
              </span>
            </h2>
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginBottom: '2rem',
              maxWidth: '32rem',
              margin: '0 auto 2rem'
            }}>
              Join thousands of creators who trust StockMedia Pro for their content needs. 
              Start your free trial today and experience the difference.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem 2rem',
                background: 'white',
                color: '#3b82f6',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}>
                Start Free Trial
                <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
              </Link>
              <Link href="/contact" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem 2rem',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}>
                Talk to Sales
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#111827', color: 'white' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1rem' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '2rem' 
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={20} color="white" />
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>StockMedia Pro</span>
                </div>
                <p style={{ color: '#9ca3af' }}>
                  The future of stock media for modern creative teams.
                </p>
              </div>
              
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>Product</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link href="/dashboard/download" style={{ color: '#9ca3af', textDecoration: 'none' }}>Download</Link>
                  <Link href="/pricing" style={{ color: '#9ca3af', textDecoration: 'none' }}>Pricing</Link>
                  <Link href="/features" style={{ color: '#9ca3af', textDecoration: 'none' }}>Features</Link>
                  <Link href="/api" style={{ color: '#9ca3af', textDecoration: 'none' }}>API</Link>
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>Company</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link href="/about" style={{ color: '#9ca3af', textDecoration: 'none' }}>About</Link>
                  <Link href="/careers" style={{ color: '#9ca3af', textDecoration: 'none' }}>Careers</Link>
                  <Link href="/blog" style={{ color: '#9ca3af', textDecoration: 'none' }}>Blog</Link>
                  <Link href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</Link>
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>Support</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link href="/dashboard/support" style={{ color: '#9ca3af', textDecoration: 'none' }}>Support Hub</Link>
                  <Link href="/dashboard/support?tab=faq" style={{ color: '#9ca3af', textDecoration: 'none' }}>FAQ & Help</Link>
                  <Link href="/dashboard/support?tab=contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Submit Ticket</Link>
                  <Link href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</Link>
                </div>
              </div>
            </div>
            
            <div style={{ 
              borderTop: '1px solid #374151', 
              marginTop: '3rem', 
              paddingTop: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                © 2024 StockMedia Pro. All rights reserved.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <Link href="/terms" style={{ fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'none' }}>Terms</Link>
                <Link href="/privacy" style={{ fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'none' }}>Privacy</Link>
                <Link href="/cookies" style={{ fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'none' }}>Cookies</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}