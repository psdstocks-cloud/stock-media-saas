'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Download, 
  User, 
  HelpCircle, 
  LogOut, 
  Menu,
  X,
  Search
} from 'lucide-react'
import { useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Browse Media', href: '/dashboard/browse', icon: Search },
    { name: 'My Orders', href: '/dashboard/orders', icon: Download },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Support', href: '/dashboard/support', icon: HelpCircle },
  ]

  const isActive = (href: string) => pathname === href

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{
            marginTop: '16px',
            color: 'white',
            fontSize: '18px'
          }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id) {
    router.push('/auth/login')
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          {/* Logo */}
          <Link href="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: '#1f2937',
            fontWeight: '700',
            fontSize: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              S
            </div>
            Stock Media
          </Link>

          {/* Desktop Navigation */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive(item.href) ? '#667eea' : '#6b7280',
                    fontWeight: isActive(item.href) ? '600' : '500',
                    background: isActive(item.href) ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    transition: 'all 0.2s ease',
                    fontSize: '14px'
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px' }} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Menu - Privacy Protected */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            {/* User Info - Privacy First */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '20px',
              fontSize: '14px',
              color: '#667eea',
              fontWeight: '600'
            }}>
              {/* User Avatar */}
              <div style={{
                width: '28px',
                height: '28px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '12px',
                textTransform: 'uppercase'
              }}>
                {(session.user.name || 'U').charAt(0)}
              </div>
              
              {/* User Name - First Name Only */}
              <span style={{ fontWeight: '600' }}>
                {session.user.name?.split(' ')[0] || 'User'}
              </span>
              
              {/* Online Status */}
              <div style={{
                width: '6px',
                height: '6px',
                background: '#10b981',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></div>
            </div>
            
            <button
              onClick={() => signOut()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} />
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isMobileMenuOpen ? (
                <X style={{ width: '20px', height: '20px' }} />
              ) : (
                <Menu style={{ width: '20px', height: '20px' }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div style={{
            background: 'rgba(255,255,255,0.98)',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            padding: '16px 24px'
          }}>
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: isActive(item.href) ? '#667eea' : '#6b7280',
                      fontWeight: isActive(item.href) ? '600' : '500',
                      background: isActive(item.href) ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                      transition: 'all 0.2s ease',
                      fontSize: '16px'
                    }}
                  >
                    <Icon style={{ width: '20px', height: '20px' }} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{
        minHeight: 'calc(100vh - 64px)',
        padding: '0'
      }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '32px 24px',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px'
        }}>
          {/* Company Info */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                S
              </div>
              <span style={{
                color: 'white',
                fontSize: '20px',
                fontWeight: '700'
              }}>
                Stock Media
              </span>
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: 0
            }}>
              Your one-stop solution for premium stock media downloads. 
              Access millions of high-quality images, videos, and audio files 
              at affordable prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              Quick Links
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              Support
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <Link
                href="/dashboard/support"
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.2s ease'
                }}
              >
                Help Center
              </Link>
              <Link
                href="/dashboard/support"
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.2s ease'
                }}
              >
                Contact Us
              </Link>
              <Link
                href="/dashboard/support"
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.2s ease'
                }}
              >
                Report Issue
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              Contact
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '14px',
                margin: 0
              }}>
                Email: support@stockmedia.com
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '14px',
                margin: 0
              }}>
                Available 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginTop: '32px',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '12px',
            margin: 0
          }}>
            © 2024 Stock Media. All rights reserved.
          </p>
          <div style={{
            display: 'flex',
            gap: '24px'
          }}>
            <Link
              href="#"
              style={{
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '12px',
                transition: 'color 0.2s ease'
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              style={{
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '12px',
                transition: 'color 0.2s ease'
              }}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
          nav[style*="display: flex"] {
            display: none !important;
          }
          
          button[style*="display: none"] {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}
