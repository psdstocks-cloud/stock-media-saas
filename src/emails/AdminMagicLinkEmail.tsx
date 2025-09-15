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
  url: string
  email: string
}

export const AdminMagicLinkEmail = ({
  url,
  email,
}: AdminMagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Sign in to your Admin Account - Stock Media SaaS</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Heading style={logo}>Stock Media SaaS</Heading>
          </Section>
          
          <Section style={content}>
            <Heading style={h1}>🔐 Admin Access Request</Heading>
            
            <Text style={text}>
              Hello,
            </Text>
            
            <Text style={text}>
              You requested access to the Stock Media SaaS admin panel. Click the button below to sign in securely.
            </Text>
            
            <Section style={buttonContainer}>
              <Link href={url} style={button}>
                Sign In to Admin Panel
              </Link>
            </Section>
            
            <Text style={text}>
              This link will expire in <strong>10 minutes</strong> for security reasons.
            </Text>
            
            <Text style={text}>
              If you didn't request this access, please ignore this email or contact support if you have concerns.
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent to {email}
            </Text>
            <Text style={footerText}>
              © 2024 Stock Media SaaS. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const logo = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
}

const content = {
  padding: '0 48px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '16px 32px',
  textDecoration: 'none',
  textAlign: 'center' as const,
}

const footer = {
  borderTop: '1px solid #e5e7eb',
  marginTop: '48px',
  padding: '24px 48px 0',
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}

export default AdminMagicLinkEmail