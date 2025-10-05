'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search,
  Coins,
  User,
  Settings,
  LogOut,
  Bell,
  Plus,
  Command,
  Home,
  LayoutDashboard,
  Download,
  ShoppingCart,
  CreditCard,
  Key,
  HelpCircle,
  ChevronDown,
  Loader2,
  Shield,
  TrendingUp,
  Activity
} from 'lucide-react'

interface AuthUser {
  id: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  isAdmin: boolean
  isUser: boolean
}

interface NavigationItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & stats'
  },
  {
    label: 'Browse',
    href: '/dashboard/browse',
    icon: Search,
    description: 'Find stock media'
  },
  {
    label: 'Downloads',
    href: '/dashboard/downloads',
    icon: Download,
    description: 'Your library'
  },
  {
    label: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    description: 'Order history'
  },
  {
    label: 'Points',
    href: '/dashboard/points',
    icon: Coins,
    description: 'Balance & billing'
  }
]

const secondaryItems: NavigationItem[] = [
  {
    label: 'Subscription',
    href: '/dashboard/subscription',
    icon: CreditCard,
    description: 'Manage your plan'
  },
  {
    label: 'API Keys',
    href: '/dashboard/api-keys',
    icon: Key,
    description: 'Developer access'
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account settings'
  },
  {
    label: 'Support',
    href: '/dashboard/support',
    icon: HelpCircle,
    description: 'Get help'
  }
]

export default function ModernHeader() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userPoints, setUserPoints] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(0)
  
  const pathname = usePathname()
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)
  const { resolvedTheme } = useTheme()

  // Don't show header on these routes
  const noHeaderRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  const shouldShowHeader = !noHeaderRoutes.some(route => pathname.startsWith(route))
  
  // Check if we're in dashboard area
  const isDashboardArea = pathname.startsWith('/dashboard')

  useEffect(() => {
    if (shouldShowHeader) {
      checkAuth()
    } else {
      setIsLoading(false)
    }

    // Command palette keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
        setTimeout(() => searchRef.current?.focus(), 100)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shouldShowHeader])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          setUser(data.user)
          setIsAuthenticated(true)
          await loadUserPoints()
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserPoints = async () => {
    try {
      const response = await fetch('/api/points', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.summary) {
          setUserPoints(data.summary.currentPoints || 0)
        }
      }
    } catch (error) {
      console.log('Points load failed (non-critical):', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      setIsAuthenticated(false)
      setUser(null)
      setUserPoints(0)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getActiveNavItem = () => {
    return [...navigationItems, ...secondaryItems].find(item => 
      pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
    )
  }

  const activeItem = getActiveNavItem()

  if (!shouldShowHeader) return null

  return (
    <>
      {/* Modern Header with Dark Mode Support */}
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-colors duration-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Section - Logo & Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link 
                href="/" 
                className="flex items-center space-x-2 group"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                  <span className="text-white font-bold text-sm">SM</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  StockMedia Pro
                </span>
              </Link>

              {/* Main Navigation - Only show in dashboard */}
              {isDashboardArea && isAuthenticated && (
                <nav className="hidden lg:flex items-center space-x-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || 
                      (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          group relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${isActive 
                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 shadow-sm' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }
                        `}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`} />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-1 h-5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 dark:bg-orange-400 rounded-full" />
                        )}
                      </Link>
                    )
                  })}
                </nav>
              )}
            </div>

            {/* Center Section - Search (Dashboard only) */}
            {isDashboardArea && isAuthenticated && (
              <div className="hidden md:flex flex-1 max-w-lg mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    ref={searchRef}
                    placeholder="Search stock sites, downloads... (⌘K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Badge variant="outline" className="text-xs h-5 px-1.5 border-gray-300 dark:border-gray-600">
                      <Command className="h-2.5 w-2.5 mr-1" />
                      K
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Loading...</span>
                </div>
              ) : isAuthenticated && user ? (
                <>
                  {/* Quick Actions */}
                  <div className="hidden lg:flex items-center space-x-3">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Points Display */}
                    <Link href="/dashboard/points">
                      <Button variant="outline" size="sm" className="flex items-center space-x-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Coins className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{userPoints}</span>
                        <span className="text-gray-500 dark:text-gray-400">points</span>
                      </Button>
                    </Link>

                    {/* Notifications */}
                    <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      {notifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-orange-500 hover:bg-orange-600">
                          {notifications}
                        </Badge>
                      )}
                    </Button>

                    {/* Quick Add */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">
                          <Plus className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Quick</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/browse" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                            <Search className="h-4 w-4" />
                            <span>Browse Media</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/subscription" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                            <CreditCard className="h-4 w-4" />
                            <span>Upgrade Plan</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/api-keys" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                            <Key className="h-4 w-4" />
                            <span>Create API Key</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Mobile Menu */}
                  <div className="lg:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-white" />
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <DropdownMenuLabel>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">{user.email}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{userPoints} points</div>
                            </div>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                        
                        {/* Mobile Navigation */}
                        {isDashboardArea && (
                          <>
                            {navigationItems.map((item) => {
                              const Icon = item.icon
                              return (
                                <DropdownMenuItem key={item.href} asChild>
                                  <Link href={item.href} className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                  </Link>
                                </DropdownMenuItem>
                              )
                            })}
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                            {secondaryItems.map((item) => {
                              const Icon = item.icon
                              return (
                                <DropdownMenuItem key={item.href} asChild>
                                  <Link href={item.href} className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                  </Link>
                                </DropdownMenuItem>
                              )
                            })}
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                          </>
                        )}
                        
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Desktop User Menu */}
                  <div className="hidden lg:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2 h-9 hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div className="hidden xl:block text-left">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name || 'User'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name || 'User'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                            <Badge variant="outline" className="w-fit mt-1 border-gray-300 dark:border-gray-600">
                              {user.role}
                            </Badge>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                        
                        {!isDashboardArea && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Dashboard</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                          </>
                        )}
                        
                        {isDashboardArea && (
                          <>
                            {secondaryItems.map((item) => {
                              const Icon = item.icon
                              return (
                                <DropdownMenuItem key={item.href} asChild>
                                  <Link href={item.href} className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                  </Link>
                                </DropdownMenuItem>
                              )
                            })}
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                          </>
                        )}
                        
                        {user.isAdmin && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href="/admin" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                                <Shield className="h-4 w-4" />
                                <span>Admin Panel</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                          </>
                        )}
                        
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                // Not authenticated
                <div className="flex items-center space-x-3">
                  <ThemeToggle />
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Navigation Bar (Dashboard only) */}
          {isDashboardArea && isAuthenticated && activeItem && (
            <div className="border-t border-gray-100 dark:border-gray-800 py-2 hidden lg:block">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <activeItem.icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{activeItem.label}</span>
                    {activeItem.description && (
                      <span className="text-gray-500 dark:text-gray-400">• {activeItem.description}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Contextual Actions based on current page */}
                  {pathname === '/dashboard/browse' && (
                    <Button size="sm" variant="outline" className="border-gray-200 dark:border-gray-700">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Popular
                    </Button>
                  )}
                  {pathname === '/dashboard/points' && (
                    <Button size="sm" variant="outline" className="border-gray-200 dark:border-gray-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Buy Points
                    </Button>
                  )}
                  {pathname === '/dashboard' && (
                    <Button size="sm" variant="outline" className="border-gray-200 dark:border-gray-700">
                      <Activity className="h-4 w-4 mr-1" />
                      Activity
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}