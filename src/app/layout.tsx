import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import QueryProvider from "@/components/providers/QueryProvider";
import GlobalLayout from "@/components/layout/GlobalLayout";
import { headers } from 'next/headers';

// Force dynamic rendering for the entire app
export const dynamic = 'force-dynamic'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "StockMedia Pro - Premium Stock Media Downloads",
    template: "%s | StockMedia Pro"
  },
  description: "Access millions of premium stock photos, videos, and graphics from 500+ top sites worldwide. Download instantly with our point-based system and commercial licensing.",
  keywords: [
    "stock photos",
    "stock videos",
    "stock graphics",
    "premium media",
    "commercial license",
    "stock media downloads",
    "creative assets",
    "design resources",
    "photography",
    "videography"
  ],
  authors: [{ name: "StockMedia Pro Team" }],
  creator: "StockMedia Pro",
  publisher: "StockMedia Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://stock-media-saas.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://stock-media-saas.vercel.app',
    title: 'StockMedia Pro - Premium Stock Media Downloads',
    description: 'Access millions of premium stock photos, videos, and graphics from 500+ top sites worldwide. Download instantly with our point-based system and commercial licensing.',
    siteName: 'StockMedia Pro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'StockMedia Pro - Premium Stock Media Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StockMedia Pro - Premium Stock Media Downloads',
    description: 'Access millions of premium stock photos, videos, and graphics from 500+ top sites worldwide.',
    images: ['/next.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthSessionProvider>
            <GlobalLayout>
              {children}
            </GlobalLayout>
          </AuthSessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
