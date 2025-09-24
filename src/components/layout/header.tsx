"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, Search, User, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface HeaderProps {
  className?: string
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, ...props }, ref) => {
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
      const onScroll = () => {
        setIsScrolled(window.scrollY > 4)
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
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
            <a href="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
              Dashboard
            </a>
            <a href="/dashboard/order-v3" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
              Order Media
            </a>
            <a href="/dashboard/history-v3" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
              History
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
              How it works
            </a>
            <a href="/dashboard/order-v2" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
              Order v2
            </a>
            <a href="/dashboard/history-v2" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
              History v2
            </a>
            <a href="/pricing" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
              Pricing
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex focus-visible:ring-2 focus-visible:ring-primary/60">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex focus-visible:ring-2 focus-visible:ring-primary/60">
              <Bell className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <Button variant="brand" size="sm" className="focus-visible:ring-2 focus-visible:ring-primary/60">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden focus-visible:ring-2 focus-visible:ring-primary/60">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
    )
  }
)
Header.displayName = "Header"

export { Header }
