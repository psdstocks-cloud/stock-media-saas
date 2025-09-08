'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        // Check if user is admin
        const session = await getSession()
        if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '32px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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

        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              color: '#16a34a'
            }}>
              ✓
            </div>
            <p style={{ color: '#16a34a', margin: 0 }}>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
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
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                color: '#dc2626'
              }}>
                ⚠️
              </div>
              <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In →'}
          </button>
        </form>

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