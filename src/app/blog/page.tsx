import Link from 'next/link'

export default function BlogPage() {
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
              Blog
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#64748b',
              lineHeight: '1.6'
            }}>
              Stay updated with the latest trends, tips, and insights in stock media and creative design.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px',
            marginBottom: '64px'
          }}>
            {[
              {
                title: '10 Tips for Choosing the Perfect Stock Photo',
                excerpt: 'Learn how to select stock photos that enhance your brand and connect with your audience.',
                date: 'December 15, 2024',
                readTime: '5 min read'
              },
              {
                title: 'Understanding Commercial Licensing for Stock Media',
                excerpt: 'A comprehensive guide to commercial licensing and what you need to know before using stock media.',
                date: 'December 10, 2024',
                readTime: '8 min read'
              },
              {
                title: 'The Future of AI in Stock Photography',
                excerpt: 'Exploring how artificial intelligence is transforming the stock photography industry.',
                date: 'December 5, 2024',
                readTime: '6 min read'
              },
              {
                title: 'Best Practices for Stock Video Selection',
                excerpt: 'Tips and tricks for choosing the right stock videos for your marketing campaigns.',
                date: 'November 28, 2024',
                readTime: '7 min read'
              },
              {
                title: 'Color Psychology in Visual Marketing',
                excerpt: 'How different colors affect consumer behavior and how to use this in your visual content.',
                date: 'November 20, 2024',
                readTime: '9 min read'
              },
              {
                title: 'Building a Consistent Visual Brand Identity',
                excerpt: 'Learn how to create a cohesive visual brand using stock media and design principles.',
                date: 'November 15, 2024',
                readTime: '6 min read'
              }
            ].map((post, index) => (
              <article key={index} style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}>
                <div style={{
                  height: '200px',
                  background: 'linear-gradient(135deg, #e0f2fe, #bfdbfe)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}>
                  📸
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#0f172a',
                    marginBottom: '12px',
                    lineHeight: '1.4'
                  }}>
                    {post.title}
                  </h3>
                  <p style={{
                    color: '#64748b',
                    lineHeight: '1.6',
                    marginBottom: '16px'
                  }}>
                    {post.excerpt}
                  </p>
                  <button style={{
                    color: '#2563eb',
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: 0
                  }}>
                    Read More →
                  </button>
                </div>
              </article>
            ))}
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
              Stay Updated
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              marginBottom: '32px'
            }}>
              Subscribe to our newsletter for the latest blog posts and industry insights.
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  padding: '12px 16px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '16px',
                  minWidth: '300px',
                  outline: 'none'
                }}
              />
              <button style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer'
              }}>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
