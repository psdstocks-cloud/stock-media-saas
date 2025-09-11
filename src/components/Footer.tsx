'use client'

import Link from 'next/link'
import { ContactInfo } from '@/components/ui/ContactInfo'

interface FooterProps {
  variant?: 'home' | 'dashboard' | 'auth'
}

export default function Footer({ variant = 'home' }: FooterProps) {
  return (
    <footer style={{
      background: '#0f172a',
      color: 'white',
      padding: '64px 0'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* Brand Section */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
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
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>StockMedia Pro</span>
            </div>
            <p style={{
              color: '#94a3b8',
              lineHeight: '1.6',
              marginBottom: '24px',
              maxWidth: '400px'
            }}>
              The ultimate platform for accessing premium stock media from 500+ top sites worldwide. 
              Download instantly with commercial licensing and our innovative point-based system.
            </p>
            
            {/* Newsletter Signup */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                Stay Updated
              </h4>
              <div style={{ display: 'flex', gap: '8px', maxWidth: '300px' }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #374151',
                    background: '#1f2937',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
                <button style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Subscribe
                </button>
              </div>
            </div>
            
            {/* Social Links */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Twitter</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>LinkedIn</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Instagram</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>YouTube</a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/dashboard/browse" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Browse Media</Link>
              <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Dashboard</Link>
              <Link href="/api" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>API Access</Link>
              <Link href="/integrations" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Integrations</Link>
              <Link href="/mobile" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Mobile App</Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/about" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>About Us</Link>
              <Link href="/careers" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Careers</Link>
              <Link href="/blog" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Blog</Link>
              <Link href="/press" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Press</Link>
              <Link href="/partners" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Partners</Link>
            </div>
          </div>

          {/* Support Links */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/help" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Help Center</Link>
              <Link href="/contact" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Contact Us</Link>
              <Link href="/status" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>System Status</Link>
              <Link href="/tutorials" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Tutorials</Link>
              <Link href="/community" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Community</Link>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <ContactInfo variant="footer" />
          </div>

          {/* Legal Links */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy Policy</Link>
              <Link href="/terms" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Terms of Service</Link>
              <Link href="/licenses" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Licenses</Link>
              <Link href="/cookies" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Cookie Policy</Link>
              <Link href="/gdpr" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>GDPR</Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          borderTop: '1px solid #374151',
          paddingTop: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            fontSize: '14px',
            color: '#94a3b8'
          }}>
            <span>© 2024 StockMedia Pro. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy</Link>
              <Link href="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms</Link>
              <Link href="/cookies" style={{ color: '#94a3b8', textDecoration: 'none' }}>Cookies</Link>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <span>Made with ❤️ for creators worldwide</span>
            <span>•</span>
            <span>Powered by Next.js & Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  )
}