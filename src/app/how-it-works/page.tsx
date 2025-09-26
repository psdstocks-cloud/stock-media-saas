import { Typography } from "@/components/ui"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import type { Metadata } from "next"
import HowItWorksClient from "./HowItWorksClient"
import type { Metadata } from "next"

export const revalidate = 120

export const metadata: Metadata = {
  title: "How It Works • Stock Media SaaS",
  description: "Paste a stock URL, confirm points, and download with fresh links. Three simple steps.",
  openGraph: {
    title: "How It Works • Stock Media SaaS",
    description: "Paste a stock URL, confirm points, and download with fresh links.",
  },
}

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorksClient />
      <HowItWorksSection />
    </>
  )
}


