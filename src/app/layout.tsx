import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ErrorBoundary } from "@/components/ErrorBoundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stock Media SaaS - Design System Demo",
  description: "A modern, production-ready SaaS platform with Material.io efficiency, Spotify UX, and Figma's minimalist design.",
  keywords: ["stock media", "saas", "design system", "react", "nextjs", "tailwind"],
  authors: [{ name: "Stock Media SaaS Team" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Stock Media SaaS - Design System Demo",
    description: "A modern, production-ready SaaS platform with Material.io efficiency, Spotify UX, and Figma's minimalist design.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Stock Media SaaS preview"
      }
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline theme script to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
  (function(){
    try {
      var stored = localStorage.getItem('theme');
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var useDark = stored ? stored === 'dark' : prefersDark;
      if (useDark) { document.documentElement.classList.add('dark'); }
    } catch (e) { /* no-op */ }
  })();
          `}}
        />
        {/* JSON-LD: Organization and Product */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Stock Media SaaS",
              "url": "https://stock-media-saas.vercel.app",
              "logo": "https://stock-media-saas.vercel.app/og-image.png",
              "sameAs": [
                "https://twitter.com",
                "https://www.linkedin.com",
                "https://github.com"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Stock Media Points",
              "image": ["https://stock-media-saas.vercel.app/og-image.png"],
              "description": "Point-based access to premium stock assets across 50+ providers.",
              "brand": {
                "@type": "Brand",
                "name": "Stock Media SaaS"
              },
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "USD",
                "lowPrice": "9.99",
                "highPrice": "69.99",
                "offerCount": "3"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))] px-3 py-2 rounded">
          Skip to content
        </a>
        <ErrorBoundary>
          <main id="main" role="main">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  )
}
