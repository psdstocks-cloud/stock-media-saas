import Link from 'next/link'

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '32px',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
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
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#0f172a',
            marginBottom: '8px'
          }}>
            Welcome Back
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '16px'
          }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form action="/api/auth/signin/credentials" method="POST" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In →
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: 0
          }}>
            Don't have an account?{' '}
            <Link href="/register" style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}