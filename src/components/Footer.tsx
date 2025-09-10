'use client'

import Link from 'next/link'

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
          gap: '32px'
        }}>
          {/* Brand Section */}
          <div>
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
              marginBottom: '24px'
            }}>
              The ultimate platform for accessing premium stock media from around the world.
            </p>
            
            {/* Social Links */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Twitter</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>LinkedIn</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Instagram</a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>Product</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Features</a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pricing</a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="/api" style={{ color: '#94a3b8', textDecoration: 'none' }}>API</a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="/documentation" style={{ color: '#94a3b8', textDecoration: 'none' }}>Documentation</a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>Company</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <Link href="/about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About</Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link href="/blog" style={{ color: '#94a3b8', textDecoration: 'none' }}>Blog</Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link href="/careers" style={{ color: '#94a3b8', textDecoration: 'none' }}>Careers</Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link href="/contact" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contact</Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>Support</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <Link href="/dashboard/support" style={{ color: '#94a3b8', textDecoration: 'none' }}>Help Center</Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="/status" style={{ color: '#94a3b8', textDecoration: 'none' }}>Status</a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy</Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link href="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          borderTop: '1px solid #334155',
          marginTop: '48px',
          paddingTop: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            © 2024 StockMedia Pro. All rights reserved.
          </p>
          
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>
              Made with ❤️ for creators
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#10b981',
              fontSize: '14px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </footer>
  )
}
