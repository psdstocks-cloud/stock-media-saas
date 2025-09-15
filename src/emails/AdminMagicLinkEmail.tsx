import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface AdminMagicLinkEmailProps {
  url: string
  email: string
}

export const AdminMagicLinkEmail = ({ url, email }: AdminMagicLinkEmailProps) => {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://stock-media-saas.vercel.app'

  return (
    <Html>
      <Head />
      <Preview>Secure sign-in link for your admin account</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="40"
              height="40"
              alt="Stock Media SaaS"
              style={logo}
            />
            <Text style={brandName}>Stock Media SaaS</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>🔐 Secure Sign-in for Admin Portal</Heading>
            
            <Text style={text}>
              Hello,
            </Text>
            
            <Text style={text}>
              You requested to sign in to your admin account. Click the button below to securely access your admin dashboard.
            </Text>

            {/* Call-to-Action Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={url}>
                Sign In to Admin Panel
              </Button>
            </Section>

            {/* Security Information */}
            <Section style={securityInfo}>
              <Text style={securityText}>
                <strong>Security Notice:</strong>
              </Text>
              <Text style={securityText}>
                • This link is one-time use only and will expire in 10 minutes
              </Text>
              <Text style={securityText}>
                • If you didn't request this email, you can safely ignore it
              </Text>
              <Text style={securityText}>
                • Never share this link with anyone
              </Text>
            </Section>

            {/* Alternative Link */}
            <Text style={text}>
              If the button doesn't work, copy and paste this link into your browser:
            </Text>
            <Link href={url} style={link}>
              {url}
            </Link>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent to {email}
            </Text>
            <Text style={footerText}>
              © 2024 Stock Media SaaS. All rights reserved.
            </Text>
            <Text style={footerText}>
              If you did not request this email, you can safely ignore it.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 24px 0',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
  borderRadius: '8px',
}

const brandName = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '12px 0 0',
  textAlign: 'center' as const,
}

const content = {
  padding: '24px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  border: 'none',
  cursor: 'pointer',
}

const securityInfo = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
}

const securityText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}

const link = {
  color: '#667eea',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const footer = {
  padding: '0 24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0',
}

export default AdminMagicLinkEmail