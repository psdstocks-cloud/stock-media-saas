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
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
