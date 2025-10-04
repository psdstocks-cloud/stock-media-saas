'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Typography, Button } from '@/components/ui'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { 
  User, 
  LogOut, 
  Menu,
  X,
  Home,
  Link as LinkIcon,
  History,
  Download,
  ChevronDown,
  Shield
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface AdminUser {
  id: string
  email: string
  name?: string
  role: string
}

export function Header() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
          setUser(data.user)
        }
      }
    } catch (error) {
      console.log('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setIsAuthenticated(false)
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if logout fails
      window.location.href = '/'
    }
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Contact', href: '/contact' }
  ]

  const userNavigation = isAuthenticated ? [
    { name: 'Admin Panel', href: '/admin/dashboard', icon: Shield },
  ] : []

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
              Stock Media SaaS
            </Typography>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {status === 'loading' ? (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <Typography variant="body-sm" className="text-gray-600 dark:text-gray-300">
                  Loading...
                </Typography>
              </div>
            ) : isAuthenticated ? (
              // User Dropdown Menu
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isAdminAuthenticated 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                      : 'bg-gradient-to-r from-green-500 to-blue-500'
                  }`}>
                    {isAdminAuthenticated ? (
                      <Shield className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400 leading-none">
                      Hi,
                    </Typography>
                    <Typography variant="body" className="font-medium text-gray-900 dark:text-white leading-none">
                      {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}
                    </Typography>
                    {isAdminAuthenticated && (
                      <Typography variant="caption" className="text-purple-600 dark:text-purple-400 text-xs">
                        Admin
                      </Typography>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    {userNavigation.map((item) => {
                      const IconComponent = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <IconComponent className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                          {item.name}
                        </Link>
                      )
                    })}
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/login')}
                  className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            {/* Mobile Theme Toggle */}
            <div className="flex justify-center mb-4">
              <ThemeToggle />
            </div>
            
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {status === 'loading' ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <Typography variant="body-sm" className="ml-2 text-gray-600 dark:text-gray-300">
                    Loading...
                  </Typography>
                </div>
              ) : isAuthenticated ? (
                <div className="space-y-2">
                  {/* Mobile User Greeting */}
                  <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg mx-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      isAdminAuthenticated 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                        : 'bg-gradient-to-r from-green-500 to-blue-500'
                    }`}>
                      {isAdminAuthenticated ? (
                        <Shield className="h-4 w-4 text-white" />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">
                        Hi,
                      </Typography>
                      <Typography variant="body" className="font-medium text-gray-900 dark:text-white">
                        {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}
                      </Typography>
                      {isAdminAuthenticated && (
                        <Typography variant="caption" className="text-purple-600 dark:text-purple-400 text-xs">
                          Admin
                        </Typography>
                      )}
                    </div>
                  </div>

                  {/* Mobile User Navigation */}
                  {userNavigation.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <IconComponent className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                        {item.name}
                      </Link>
                    )
                  })}

                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/login')
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      router.push('/register')
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
