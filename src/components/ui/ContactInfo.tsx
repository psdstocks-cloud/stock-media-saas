'use client'

import { Mail, Phone, MapPin, Clock, MessageCircle, Headphones, FileText, Users } from 'lucide-react'

interface ContactMethod {
  icon: any
  title: string
  description: string
  value: string
  action: string
  availability?: string
}

const contactMethods: ContactMethod[] = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email',
    value: 'support@stockmediapro.com',
    action: 'mailto:support@stockmediapro.com',
    availability: '24/7 response within 2 hours'
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Speak with our team',
    value: '+1 (555) 123-4567',
    action: 'tel:+15551234567',
    availability: 'Mon-Fri 9AM-6PM PST'
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Instant help via chat',
    value: 'Start Chat',
    action: '#',
    availability: 'Available now'
  },
  {
    icon: Headphones,
    title: 'Priority Support',
    description: 'Dedicated support for Pro users',
    value: 'priority@stockmediapro.com',
    action: 'mailto:priority@stockmediapro.com',
    availability: '24/7 response within 30 minutes'
  }
]

const businessInfo = [
  {
    icon: MapPin,
    title: 'Headquarters',
    value: '123 Creative Street\nSan Francisco, CA 94105\nUnited States'
  },
  {
    icon: Clock,
    title: 'Business Hours',
    value: 'Monday - Friday: 9:00 AM - 6:00 PM PST\nSaturday: 10:00 AM - 4:00 PM PST\nSunday: Closed'
  },
  {
    icon: Users,
    title: 'Sales Team',
    value: 'sales@stockmediapro.com\n+1 (555) 123-4568'
  },
  {
    icon: FileText,
    title: 'Legal & Compliance',
    value: 'legal@stockmediapro.com\n+1 (555) 123-4569'
  }
]

interface ContactInfoProps {
  variant?: 'full' | 'compact' | 'footer'
  className?: string
}

export function ContactInfo({ variant = 'full', className }: ContactInfoProps) {
  if (variant === 'footer') {
    return (
      <div className={`space-y-4 ${className}`}>
        <h4 className="text-lg font-semibold text-gray-900">Contact Us</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-gray-500" />
            <a href="mailto:support@stockmediapro.com" className="text-gray-600 hover:text-gray-900">
              support@stockmediapro.com
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-gray-500" />
            <a href="tel:+15551234567" className="text-gray-600 hover:text-gray-900">
              +1 (555) 123-4567
            </a>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-gray-500" />
            <span className="text-gray-600">San Francisco, CA</span>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-6 ${className}`}>
        <h3 className="text-xl font-bold text-gray-900">Get in Touch</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contactMethods.slice(0, 4).map((method, index) => (
            <a
              key={index}
              href={method.action}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <method.icon size={20} className="text-blue-600" />
              <div>
                <h4 className="font-semibold text-gray-900">{method.title}</h4>
                <p className="text-sm text-gray-600">{method.value}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Contact Methods */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Get in Touch</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.action}
              className="group p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <method.icon size={32} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                <p className="text-blue-600 font-medium mb-2">{method.value}</p>
                {method.availability && (
                  <p className="text-xs text-gray-500">{method.availability}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Business Information</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {businessInfo.map((info, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <info.icon size={24} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{info.title}</h4>
                <p className="text-gray-600 whitespace-pre-line">{info.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Response Times */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Response Times</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Live Chat</h4>
            <p className="text-gray-600">Instant response</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📧</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Email Support</h4>
            <p className="text-gray-600">Within 2 hours</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Priority Support</h4>
            <p className="text-gray-600">Within 30 minutes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
