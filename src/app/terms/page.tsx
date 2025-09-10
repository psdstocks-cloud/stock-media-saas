import Link from 'next/link'

export default function TermsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '80px 0' }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            background: 'white',
            padding: '48px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 48px)',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '24px'
            }}>
              Terms of Service
            </h1>
            
            <p style={{
              color: '#64748b',
              marginBottom: '32px',
              fontSize: '16px'
            }}>
              Last updated: December 10, 2024
            </p>

            <div style={{ lineHeight: '1.8', color: '#374151' }}>
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  1. Acceptance of Terms
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  By accessing and using StockMedia Pro, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please 
                  do not use this service.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  2. Description of Service
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  StockMedia Pro provides access to premium stock media including photos, videos, 
                  graphics, and other creative assets from various stock media providers. Our service 
                  includes:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>Access to millions of stock media files</li>
                  <li>Commercial licensing for downloads</li>
                  <li>Point-based purchasing system</li>
                  <li>API access for developers</li>
                  <li>Customer support and assistance</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  3. User Accounts
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  To access certain features of our service, you must create an account. You agree to:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  4. Payment and Billing
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Payment terms include:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>All fees are non-refundable unless otherwise stated</li>
                  <li>Prices are subject to change with 30 days notice</li>
                  <li>Billing occurs monthly or annually based on your plan</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  5. License and Usage Rights
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  When you download content through our service, you receive:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>Commercial use rights for downloaded content</li>
                  <li>No attribution requirements</li>
                  <li>Unlimited use within your organization</li>
                  <li>Prohibition on resale or redistribution of content</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  6. Prohibited Uses
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  You may not use our service to:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use content for illegal or harmful purposes</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  7. Service Availability
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We strive to maintain high service availability but cannot guarantee uninterrupted access. 
                  We reserve the right to modify, suspend, or discontinue the service at any time.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  8. Limitation of Liability
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  To the maximum extent permitted by law, StockMedia Pro shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages resulting from your 
                  use of the service.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  9. Termination
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Either party may terminate this agreement at any time. Upon termination, your right 
                  to use the service ceases immediately, and you must stop all use of downloaded content 
                  unless otherwise specified in your license.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  10. Changes to Terms
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We reserve the right to modify these terms at any time. We will notify users of 
                  significant changes via email or through our service. Continued use constitutes 
                  acceptance of the modified terms.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  11. Contact Information
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ margin: '0 0 8px 0' }}>Email: legal@stockmediapro.com</p>
                  <p style={{ margin: '0' }}>Address: 123 Business St, City, State 12345</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
