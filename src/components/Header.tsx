'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { User, LogOut, Settings, CreditCard, Download, Menu, X, Search } from 'lucide-react'
import { SearchBar } from '@/components/ui/SearchBar'

interface HeaderProps {
  variant?: 'home' | 'dashboard' | 'auth'
  showUserMenu?: boolean
}

export default function Header({ variant = 'home', showUserMenu = true }: HeaderProps) {
  const { data: session, status } = useSession()
  const [userBalance, setUserBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Fetch user balance
  useEffect(() => {
    if (session?.user && showUserMenu) {
      fetchUserBalance()
    }
  }, [session, showUserMenu])

  const fetchUserBalance = async () => {
    try {
      const response = await fetch('/api/points')
      if (response.ok) {
        const data = await response.json()
        setUserBalance(data.balance || 0)
      }
    } catch (error) {
      console.error('Failed to fetch user balance:', error)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDisplayName = () => {
    if (!session?.user) return ''
    return (session.user as any).displayName || session.user.name || session.user.email?.split('@')[0] || 'User'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
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
          {/* Logo */}
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

          {/* Search Bar - Show on all pages */}
          <div style={{ 
            flex: 1, 
            maxWidth: '400px', 
            margin: '0 32px',
            display: variant === 'home' ? 'block' : 'none'
          }}>
            <SearchBar 
              placeholder="Search stock media..."
              showSuggestions={true}
              onSearch={(query) => {
                window.location.href = `/dashboard/browse?q=${encodeURIComponent(query)}`
              }}
            />
          </div>

          {/* Navigation - Only show on home page */}
          {variant === 'home' && (
            <div className="desktop-nav" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '32px'
            }}>
              <a href="#features" style={{ color: '#64748b', textDecoration: 'none' }}>Features</a>
              <a href="#pricing" style={{ color: '#64748b', textDecoration: 'none' }}>Pricing</a>
              <Link href="/reviews" style={{ color: '#64748b', textDecoration: 'none' }}>Reviews</Link>
            </div>
          )}

          {/* Search Button for Dashboard */}
          {variant === 'dashboard' && (
            <button
              onClick={() => setShowSearch(!showSearch)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Search size={16} />
              Search
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: '#64748b'
            }}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* User Menu / Auth Buttons */}
          <div className={showMobileMenu ? 'user-menu-mobile' : ''} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px'
          }}>
            {status === 'loading' ? (
              <div style={{ padding: '8px 16px', color: '#64748b' }}>Loading...</div>
            ) : session && showUserMenu ? (
              <>
                {/* Points Balance */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '20px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: 'white',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span>{userBalance}</span>
                  <span style={{ opacity: 0.9, fontSize: '12px' }}>points</span>
                </div>

                {/* User Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#1d4ed8'
                    }}>
                      {getInitials(getDisplayName())}
                    </div>
                    <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                      {getDisplayName()}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      minWidth: '200px',
                      zIndex: 50
                    }}>
                      <div style={{ padding: '8px 0' }}>
                        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 16px',
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}>
                            <User size={16} />
                            <span>Dashboard</span>
                          </div>
                        </Link>
                        
                        <Link href="/dashboard/browse" style={{ textDecoration: 'none' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 16px',
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}>
                            <Download size={16} />
                            <span>Download Media</span>
                          </div>
                        </Link>
                        
                        <Link href="/dashboard/orders" style={{ textDecoration: 'none' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 16px',
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}>
                            <CreditCard size={16} />
                            <span>My Orders</span>
                          </div>
                        </Link>
                        
                        <Link href="/dashboard/profile" style={{ textDecoration: 'none' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 16px',
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}>
                            <Settings size={16} />
                            <span>Profile Settings</span>
                          </div>
                        </Link>
                        
                        <div style={{
                          height: '1px',
                          background: '#e2e8f0',
                          margin: '8px 0'
                        }} />
                        
                        <button
                          onClick={handleSignOut}
                          disabled={isLoading}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 16px',
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <LogOut size={16} />
                          <span>{isLoading ? 'Signing out...' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Links */}
      {variant === 'home' && showMobileMenu && (
        <div className="mobile-menu" style={{
          display: 'none',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <a href="#features" style={{ color: '#64748b', textDecoration: 'none', padding: '8px 0' }}>Features</a>
          <a href="#pricing" style={{ color: '#64748b', textDecoration: 'none', padding: '8px 0' }}>Pricing</a>
          <Link href="/reviews" style={{ color: '#64748b', textDecoration: 'none', padding: '8px 0' }}>Reviews</Link>
        </div>
      )}

      {/* Click outside to close dropdown and mobile menu */}
      {(showDropdown || showMobileMenu) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40
          }}
          onClick={() => {
            setShowDropdown(false)
            setShowMobileMenu(false)
          }}
        />
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          
          .mobile-menu-btn {
            display: flex !important;
          }
          
          .mobile-menu {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-bottom: 1px solid #e2e8f0;
            padding: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .user-menu-mobile {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-bottom: 1px solid #e2e8f0;
            padding: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>
    </header>
  )
}
