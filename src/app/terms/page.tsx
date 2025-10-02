"use client"

import { Typography } from "@/components/ui"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <Typography variant="h4" className="font-bold">
                Stock Media SaaS
              </Typography>
            </div>
            <div className="flex items-center space-x-4">
              <Typography variant="body-sm" className="text-muted-foreground">
                Terms of Service
              </Typography>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Typography variant="h1" className="text-4xl md:text-5xl font-bold mb-6">
            Terms of Service
          </Typography>
          <Typography variant="body-lg" className="text-muted-foreground">
            Last updated: September 19, 2024
          </Typography>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              1. Acceptance of Terms
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              By accessing and using Stock Media SaaS ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              2. Description of Service
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              Stock Media SaaS provides access to premium stock media content including photos, videos, and audio files from various licensed providers. Our platform operates on a point-based system where users purchase points to download content.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              3. User Accounts
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              To access certain features of the Service, you must register for an account. You agree to:
            </Typography>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              4. Point System and Purchases
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              Our platform uses a point-based system for content downloads:
            </Typography>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Points are purchased through various point packages</li>
              <li>Points do not expire and have no time limitations</li>
              <li>All purchases are final and non-refundable</li>
              <li>Point costs vary by content type and quality</li>
              <li>We reserve the right to adjust point costs with notice</li>
            </ul>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              5. Content Licensing
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              All content available through our Service is licensed for commercial use. By downloading content, you agree to:
            </Typography>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Use content in accordance with the license terms</li>
              <li>Not redistribute or resell downloaded content</li>
              <li>Not use content in ways that violate applicable laws</li>
              <li>Credit the content creator when required</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              6. Prohibited Uses
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              You may not use our Service:
            </Typography>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
            </ul>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              7. Intellectual Property
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              The Service and its original content, features, and functionality are and will remain the exclusive property of Stock Media SaaS and its licensors. The Service is protected by copyright, trademark, and other laws.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              8. Privacy Policy
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              9. Termination
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              10. Disclaimer
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms whether express or implied.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              11. Limitation of Liability
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              In no event shall Stock Media SaaS, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              12. Governing Law
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              These Terms shall be interpreted and governed by the laws of the State of California, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              13. Changes to Terms
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              14. Contact Information
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </Typography>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Typography variant="body" className="font-medium">
                Stock Media SaaS<br />
                Email: legal@stockmediasaas.com<br />
                Phone: +1 (555) 123-4567<br />
                Address: 123 Creative Street, San Francisco, CA 94105
              </Typography>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Typography variant="body-sm" className="text-muted-foreground">
              © 2024 Stock Media SaaS. All rights reserved.
            </Typography>
          </div>
        </div>
      </footer>
    </div>
  )
}

