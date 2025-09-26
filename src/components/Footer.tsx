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
            
            {/* Social Links + Newsletter */}
            <div className="flex space-x-4">
              <Button aria-label="Twitter" variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                <Twitter className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button aria-label="LinkedIn" variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                <Linkedin className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button aria-label="GitHub" variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                <Github className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button aria-label="Email" variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <form aria-describedby="newsletter-hint" className="mt-6 flex max-w-sm" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const input = form.querySelector('input[name=email]') as HTMLInputElement | null;
              const email = input?.value || '';
              const status = form.querySelector('#newsletter-status') as HTMLDivElement | null;
              try {
                const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
                if (res.ok) {
                  input && (input.value = '');
                  status && (status.textContent = 'Subscribed successfully!');
                } else {
                  status && (status.textContent = 'Subscription failed.');
                }
              } catch (_err) {
                status && (status.textContent = 'Network error.');
              }
            }}>
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input id="newsletter-email" name="email" type="email" placeholder="Get product updates" required autoComplete="email" className="flex-1 rounded-l-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] px-3 py-2 placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-ring" />
              <button type="submit" className="rounded-r-md px-4 bg-gradient-to-r from-primary to-secondary text-white">Subscribe</button>
            </form>
            <div id="newsletter-status" role="status" aria-live="polite" className="mt-2 text-[hsl(var(--muted-foreground))] text-sm"></div>
            <p id="newsletter-hint" className="sr-only">We respect your privacy. You can unsubscribe at any time.</p>
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
