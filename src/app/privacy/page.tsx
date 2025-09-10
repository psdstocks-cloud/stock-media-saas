import Link from 'next/link'

export default function PrivacyPage() {
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
              Privacy Policy
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
                  1. Information We Collect
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We collect information you provide directly to us, such as when you create an account, 
                  make a purchase, or contact us for support.
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>Account information (name, email address, password)</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Usage data and preferences</li>
                  <li>Communication data when you contact us</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  2. How We Use Your Information
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We use the information we collect to:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze usage and trends</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  3. Information Sharing
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  except in the following circumstances:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>With service providers who assist in our operations</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  4. Data Security
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure payment processing through Stripe</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  5. Your Rights
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  You have the right to:
                </p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Data portability</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  6. Cookies and Tracking
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We use cookies and similar technologies to enhance your experience, analyze usage, 
                  and provide personalized content. You can control cookie settings through your browser.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  7. Contact Us
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ margin: '0 0 8px 0' }}>Email: privacy@stockmediapro.com</p>
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
