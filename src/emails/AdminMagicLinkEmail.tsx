import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface AdminMagicLinkEmailProps {
  magicLink?: string
  siteName?: string
  userEmail?: string
}

export const AdminMagicLinkEmail = ({
  magicLink = 'https://example.com/api/auth/callback/email?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fadmin&token=abc123',
  siteName = 'Stock Media SaaS',
  userEmail = 'admin@example.com',
}: AdminMagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your secure admin login link for {siteName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🔐 Admin Access</Heading>
            <Text style={subtitle}>Secure login to {siteName} Admin Panel</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={text}>
              Hello Admin,
            </Text>
            <Text style={text}>
              You requested access to the {siteName} Admin Panel. Click the button below to securely sign in:
            </Text>
            
            <Section style={buttonContainer}>
              <Link href={magicLink} style={button}>
                🚀 Access Admin Panel
              </Link>
            </Section>

            <Text style={text}>
              This link will expire in <strong>10 minutes</strong> for security reasons.
            </Text>
          </Section>

          {/* Security Notice */}
          <Section style={securityNotice}>
            <Text style={securityText}>
              <strong>Security Notice:</strong> If you didn't request this login link, please ignore this email. 
              Your account remains secure.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent to {userEmail}
            </Text>
            <Text style={footerText}>
              © 2024 {siteName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#0f0f23',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const subtitle = {
  color: '#a0a0a0',
  fontSize: '16px',
  margin: '0',
}

const content = {
  padding: '24px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  marginBottom: '24px',
}

const text = {
  color: '#ffffff',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
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
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  transition: 'all 0.3s ease',
}

const securityNotice = {
  padding: '16px',
  backgroundColor: 'rgba(255, 193, 7, 0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(255, 193, 7, 0.3)',
  marginBottom: '24px',
}

const securityText = {
  color: '#ffc107',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const footer = {
  textAlign: 'center' as const,
  padding: '24px 0',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
}

const footerText = {
  color: '#a0a0a0',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px',
}

export default AdminMagicLinkEmail
