/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  eslint: {
    // Disable ESLint during builds due to Next.js 15.5.3 compatibility issues
    // Use separate lint script for CI/CD: npm run lint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TypeScript checking enabled
    ignoreBuildErrors: false,
  },
  
  // Performance Optimizations
  reactStrictMode: true,
  
  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.shutterstock.com',
      },
    ],
  },

  // Compression
  compress: true,

  // Power Pack (production only)
  poweredByHeader: false,

  // Generate ETags for browser caching
  generateEtags: true,

  // Production Source Maps (disabled for performance)
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://embed.tawk.to https://va.tawk.to https://*.tawk.to https://cdn.tawk.to https://js.tawk.to https://widget.tawk.to",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://embed.tawk.to https://va.tawk.to https://*.tawk.to https://cdn.tawk.to https://js.tawk.to https://widget.tawk.to",
              "img-src 'self' data: https: blob: https://embed.tawk.to https://va.tawk.to https://*.tawk.to https://cdn.tawk.to https://js.tawk.to https://widget.tawk.to",
              "font-src 'self' https://fonts.gstatic.com https://embed.tawk.to https://va.tawk.to https://*.tawk.to https://cdn.tawk.to https://js.tawk.to https://widget.tawk.to",
              "connect-src 'self' https://api.nehtw.com https://vitals.vercel-insights.com https://api.resend.com https://embed.tawk.to https://va.tawk.to https://*.tawk.to https://cdn.tawk.to https://js.tawk.to https://widget.tawk.to ws: wss:",
              "frame-src 'self' https://js.stripe.com https://embed.tawk.to https://*.tawk.to https://cdn.tawk.to https://js.tawk.to https://widget.tawk.to",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      },
      {
        // Cache static assets aggressively
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images
        source: '/:path*.{jpg,jpeg,png,gif,webp,avif,ico,svg}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Preload critical resources
        source: '/',
        headers: [
          {
            key: 'Link',
            value: '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig