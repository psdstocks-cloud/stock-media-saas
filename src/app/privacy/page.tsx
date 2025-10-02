"use client"

import { Typography } from "@/components/ui"

export default function PrivacyPage() {
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
                Privacy Policy
              </Typography>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Typography variant="h1" className="text-4xl md:text-5xl font-bold mb-6">
            Privacy Policy
          </Typography>
          <Typography variant="body-lg" className="text-muted-foreground">
            Last updated: September 19, 2024
          </Typography>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              1. Introduction
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              Stock Media SaaS ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              2. Information We Collect
            </Typography>
            
            <Typography variant="h3" className="text-xl font-semibold mb-3">
              2.1 Personal Information
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </Typography>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Register for an account</li>
              <li>Make purchases</li>
              <li>Contact us for support</li>
              <li>Subscribe to our newsletter</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <Typography variant="body" className="text-muted-foreground mb-4">
              This information may include your name, email address, phone number, billing address, and payment information.
            </Typography>

            <Typography variant="h3" className="text-xl font-semibold mb-3">
              2.2 Usage Information
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              We automatically collect certain information about your device and how you interact with our Service, including:
            </Typography>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>IP address and location data</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and time spent on pages</li>
              <li>Search queries and downloaded content</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              3. How We Use Your Information
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              We use the information we collect to:
            </Typography>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Develop new products and services</li>
              <li>Personalize your experience</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              4. Information Sharing and Disclosure
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
            </Typography>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>With your explicit consent</li>
              <li>To trusted service providers who assist us in operating our Service</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>In connection with a business transfer or acquisition</li>
              <li>With aggregated or anonymized data that cannot identify you</li>
            </ul>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              5. Data Security
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </Typography>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Encrypted storage of sensitive information</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication systems</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              6. Cookies and Tracking Technologies
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our Service. You can control cookie settings through your browser preferences. Types of cookies we use include:
            </Typography>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Essential cookies for basic functionality</li>
              <li>Analytics cookies to understand usage patterns</li>
              <li>Preference cookies to remember your settings</li>
              <li>Marketing cookies for personalized content</li>
            </ul>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              7. Your Rights and Choices
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </Typography>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your personal information</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Objection to processing</li>
              <li>Withdrawal of consent</li>
            </ul>
            <Typography variant="body" className="text-muted-foreground mb-4">
              To exercise these rights, please contact us using the information provided in the Contact section.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              8. Data Retention
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              We retain your personal information for as long as necessary to provide our Service and fulfill the purposes outlined in this Privacy Policy. We will delete or anonymize your information when it is no longer needed, except when we are required to retain it for legal or regulatory purposes.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              9. International Data Transfers
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              10. Children's Privacy
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              11. Third-Party Links
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              12. Changes to This Privacy Policy
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </Typography>
          </section>

          <section>
            <Typography variant="h2" className="text-2xl font-bold mb-4">
              13. Contact Us
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </Typography>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Typography variant="body" className="font-medium">
                Stock Media SaaS<br />
                Email: privacy@stockmediasaas.com<br />
                Phone: +1 (555) 123-4567<br />
                Address: 123 Creative Street, San Francisco, CA 94105<br />
                Data Protection Officer: dpo@stockmediasaas.com
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

