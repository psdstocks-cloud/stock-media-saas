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
  openGraph: {
    title: "Stock Media SaaS - Design System Demo",
    description: "A modern, production-ready SaaS platform with Material.io efficiency, Spotify UX, and Figma's minimalist design.",
    type: "website",
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
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
