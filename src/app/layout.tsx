import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { WebVitals } from "@/components/WebVitals"
import { ChatWidget } from "@/components/ChatWidget"
import { AuthProvider } from "@/components/AuthProvider"
import { ThemeProvider } from "@/contexts/ThemeContext"
import SessionProvider from "@/components/providers/SessionProvider"
import { Header } from "@/components/Header"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: {
    default: "Stock Media SaaS - Premium Stock Photos, Videos & Music",
    template: "%s | Stock Media SaaS"
  },
  description: "Access 25+ premium stock sites with one subscription. Download from Shutterstock, Adobe Stock, Freepik & more. Point-based system with rollover.",
  keywords: ["stock media", "stock photos", "stock videos", "shutterstock", "adobe stock", "freepik", "subscription", "saas"],
  authors: [{ name: "Stock Media SaaS Team" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://stock-media-saas.vercel.app'),
  openGraph: {
    title: "Stock Media SaaS - Premium Stock Assets",
    description: "Access 25+ premium stock sites with one subscription. Download photos, videos, vectors & music.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Stock Media SaaS preview"
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@stockmediasaas',
    creator: '@stockmediasaas',
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
      
      if (stored === 'dark' || (stored === 'system' && prefersDark) || (!stored && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else if (stored === 'light') {
        document.documentElement.classList.remove('dark');
      }
      
      // Set CSS custom property for theme
      var theme = stored || 'system';
      document.documentElement.style.setProperty('--theme', theme);
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
              "@type": "SoftwareApplication",
              "name": "Stock Media SaaS",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "USD",
                "lowPrice": "9.99",
                "highPrice": "199.99",
                "offerCount": "4",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1247",
                "bestRating": "5",
                "worstRating": "1"
              },
              "description": "Access premium stock photos, videos, vectors from 25+ sites including Shutterstock, Adobe Stock, and Freepik with one subscription."
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Stock Media SaaS",
              "url": "https://stock-media-saas.vercel.app",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://stock-media-saas.vercel.app/dashboard?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider>
            <AuthProvider>
              <WebVitals />
              <ChatWidget />
              <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))] px-3 py-2 rounded">
                Skip to content
              </a>
              <Header />
              <ErrorBoundary>
                <main id="main" role="main">
                  {children}
                </main>
              </ErrorBoundary>
            </AuthProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
