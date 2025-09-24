'use client'

import React from 'react'
import { Button, Typography } from '@/components/ui'
import { Heart, Share2, Twitter, Linkedin, Github, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Footer() {
  return (
    <footer className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-t border-[hsl(var(--border))]">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <Typography variant="h5" className="font-bold">
                Stock Media SaaS
              </Typography>
            </div>
            <Typography variant="body" className="text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
              The ultimate platform for stock media creators and consumers. 
              Access millions of premium assets with our revolutionary point-based system.
            </Typography>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <Typography variant="h6" className="font-semibold mb-6">
              Product
            </Typography>
            <div className="space-y-3">
              <a href="/how-it-works" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">How it works</a>
              <a href="/pricing" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Pricing</a>
              <a href="/supported-platforms" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Supported platforms</a>
              <a href="/examples" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Examples</a>
              <a href="/changelog" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Changelog</a>
            </div>
          </div>

          {/* Support Links */}
          <div>
            <Typography variant="h6" className="font-semibold mb-6">
              Support
            </Typography>
            <div className="space-y-3">
              <a href="/help" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Help Center</a>
              <a href="/contact" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Contact</a>
              <a href="/status" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Status</a>
              <a href="/accessibility" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Accessibility</a>
              <a href="/security" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Security</a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <Typography variant="h6" className="font-semibold mb-6">
              Company
            </Typography>
            <div className="space-y-3">
              <a href="/about" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">About</a>
              <a href="/blog" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Blog</a>
              <a href="/careers" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Careers</a>
              <a href="/press" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Press</a>
              <a href="/partners" className="block text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Partners</a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[hsl(var(--border))] mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
                © 2024 Stock Media SaaS. All rights reserved.
              </Typography>
              <div className="flex space-x-6">
                <a href="/privacy" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Privacy</a>
                <a href="/terms" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Terms</a>
                <a href="/cookies" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Cookies</a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
