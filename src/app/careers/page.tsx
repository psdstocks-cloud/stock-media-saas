import Link from 'next/link'

export default function CareersPage() {
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
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 48px)',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '24px'
            }}>
              Join Our Team
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#64748b',
              lineHeight: '1.6'
            }}>
              Help us build the future of stock media. We're looking for passionate individuals 
              who want to make a difference in the creative industry.
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
                Our Culture
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                We believe in fostering a collaborative, innovative, and inclusive environment 
                where every team member can thrive and contribute to our mission.
              </p>
              <ul style={{ color: '#64748b', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>Remote-first work environment</li>
                <li>Flexible working hours</li>
                <li>Professional development opportunities</li>
                <li>Competitive compensation and benefits</li>
              </ul>
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
                Benefits
              </h3>
              <ul style={{ color: '#64748b', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>Health, dental, and vision insurance</li>
                <li>401(k) with company matching</li>
                <li>Unlimited PTO</li>
                <li>Home office stipend</li>
                <li>Learning and development budget</li>
                <li>Stock options</li>
              </ul>
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
                Open Positions
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                We're always looking for talented individuals to join our growing team.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                    Senior Frontend Developer
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Full-time • Remote
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                    Backend Engineer
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Full-time • Remote
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                    Product Designer
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Full-time • Remote
                  </div>
                </div>
              </div>
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
              Don't See a Role That Fits?
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              marginBottom: '32px'
            }}>
              We're always interested in hearing from talented individuals. 
              Send us your resume and let us know how you'd like to contribute.
            </p>
            <button style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              fontSize: '18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}>
              Send Your Resume
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
