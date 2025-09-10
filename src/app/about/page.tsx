import Link from 'next/link'

export default function AboutPage() {
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
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 48px)',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '24px'
            }}>
              About StockMedia Pro
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#64748b',
              marginBottom: '48px',
              lineHeight: '1.6'
            }}>
              We're revolutionizing how creators access premium stock media from around the world.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            marginBottom: '64px'
          }}>
            <div style={{
              padding: '32px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                Our Mission
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                To democratize access to premium stock media by providing a unified platform 
                that connects creators with millions of high-quality assets from the world's 
                leading stock sites.
              </p>
            </div>

            <div style={{
              padding: '32px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                Our Vision
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                To become the go-to platform for creative professionals, agencies, and 
                businesses seeking premium stock media with seamless licensing and 
                instant downloads.
              </p>
            </div>

            <div style={{
              padding: '32px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                Our Values
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Quality, transparency, and user experience are at the core of everything 
                we do. We believe in fair pricing, clear licensing, and exceptional 
                customer support.
              </p>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '48px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '24px'
            }}>
              Ready to Get Started?
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              marginBottom: '32px'
            }}>
              Join thousands of creators who trust StockMedia Pro for their creative needs.
            </p>
            <Link href="/register">
              <button style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                fontSize: '18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}>Start Free Trial</button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
