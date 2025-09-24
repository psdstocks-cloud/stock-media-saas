"use client"
import * as React from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, Search, User, Bell } from "lucide-react"
import UserMenu from "@/components/layout/UserMenu"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface HeaderProps {
  className?: string
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, ...props }, ref) => {
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const pathname = usePathname?.() || ""
    const [isAuthed, setIsAuthed] = React.useState(false)

    React.useEffect(() => {
      const onScroll = () => {
        setIsScrolled(window.scrollY > 4)
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }, [])

    React.useEffect(() => {
      // Lightweight auth check to toggle Sign In vs Avatar
      const check = async () => {
        try {
          const res = await fetch('/api/auth/verify-token')
          if (res.ok) {
            const data = await res.json()
            setIsAuthed(Boolean(data?.user))
          }
        } catch (_e) {
          setIsAuthed(false)
        }
      }
      check()
    }, [])

    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 w-full border-b backdrop-blur transition-colors",
          isScrolled
            ? "bg-background/80 supports-[backdrop-filter]:bg-background/60 shadow-sm border-border/60"
            : "bg-background/60 supports-[backdrop-filter]:bg-background/40 border-border/40",
          className
        )}
        {...props}
      >
        {/* Skip to content for keyboard users */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow"
        >
          Skip to content
        </a>
            <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg brand-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <span className="text-xl font-bold brand-text-gradient">
                Stock Media
              </span>
            </div>
            <Badge variant="brand" className="hidden sm:inline-flex">
              SaaS Platform
            </Badge>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className={`text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded ${pathname.startsWith("/dashboard") ? "text-primary underline underline-offset-4" : "text-foreground/80 hover:text-primary"}`}>
              Dashboard
            </a>
            <a href="/dashboard/order" className={`text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded ${pathname.includes("/dashboard/order") ? "text-primary underline underline-offset-4" : "text-foreground/80 hover:text-primary"}`}>
              Order Media
            </a>
            <a href="/dashboard/history" className={`text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded ${pathname.includes("/dashboard/history") ? "text-primary underline underline-offset-4" : "text-foreground/80 hover:text-primary"}`}>
              History
            </a>
            <a href="/how-it-works" className={`text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded ${pathname === "/how-it-works" ? "text-primary underline underline-offset-4" : "text-foreground/80 hover:text-primary"}`}>
              How it works
            </a>
            <a href="/supported-platforms" className={`text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded ${pathname === "/supported-platforms" ? "text-primary underline underline-offset-4" : "text-foreground/80 hover:text-primary"}`}>
              Supported platforms
            </a>
            <a href="/help" className={`text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded ${pathname === "/help" ? "text-primary underline underline-offset-4" : "text-foreground/80 hover:text-primary"}`}>
              Help
            </a>
            <a href="/dashboard/order-v2" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
              Order v2
            </a>
            <a href="/dashboard/history-v2" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
              History v2
            </a>
            <a href="/pricing" className={`text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded ${pathname === "/pricing" ? "text-primary underline underline-offset-4" : "text-foreground/80 hover:text-primary"}`}>
              Pricing
            </a>
          </nav>

          {/* Actions (with dashboard quick actions) */}
          <div className="flex items-center space-x-2">
            {pathname.startsWith('/dashboard') && (
              <div className="hidden lg:flex items-center space-x-2 mr-2">
                <a href="/dashboard/order-v3" className="inline-flex h-9 items-center rounded-md px-3 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:opacity-90">
                  Order from URL
                </a>
                <a href="/dashboard?tab=search" className="inline-flex h-9 items-center rounded-md px-3 border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">
                  Search
                </a>
                <a href="/pricing" className="inline-flex h-9 items-center rounded-md px-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700">
                  Buy Points
                </a>
              </div>
            )}
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex focus-visible:ring-2 focus-visible:ring-primary/60">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex focus-visible:ring-2 focus-visible:ring-primary/60">
              <Bell className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <UserMenu />
            {!isAuthed && (
            <a href="/login" className="md:inline-flex hidden items-center h-9 rounded-md px-3 bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/60">
              <User className="h-4 w-4 mr-2" /> Sign In
            </a>
            )}
            <button aria-label="Open menu" onClick={() => setMobileOpen(true)} className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-[60] bg-black/40" onClick={() => setMobileOpen(false)}>
            <div role="dialog" aria-modal="true" className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-r border-[hsl(var(--border))] shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-[hsl(var(--muted))]">✕</button>
              </div>
              <nav className="grid gap-2">
                <a href="/dashboard" className="px-2 py-2 rounded hover:bg-[hsl(var(--muted))]">Dashboard</a>
                <a href="/dashboard/order-v3" className="px-2 py-2 rounded hover:bg-[hsl(var(--muted))]">Order Media</a>
                <a href="/dashboard/history-v3" className="px-2 py-2 rounded hover:bg-[hsl(var(--muted))]">History</a>
                <a href="/how-it-works" className="px-2 py-2 rounded hover:bg-[hsl(var(--muted))]">How it works</a>
                <a href="/supported-platforms" className="px-2 py-2 rounded hover:bg-[hsl(var(--muted))]">Supported platforms</a>
                <a href="/help" className="px-2 py-2 rounded hover:bg-[hsl(var(--muted))]">Help</a>
                <a href="/pricing" className="px-2 py-2 rounded hover:bg-[hsl(var(--muted))]">Pricing</a>
                <a href="/login" className="mt-2 inline-flex items-center justify-center rounded-md bg-gradient-to-r from-primary to-secondary text-white h-10">Sign In</a>
              </nav>
            </div>
          </div>
        )}
      </header>
    )
  }
)
Header.displayName = "Header"

export { Header }
