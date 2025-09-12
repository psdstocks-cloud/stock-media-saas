import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, Star, Check, Zap, Shield, Users, Globe, Sparkles, TrendingUp, Award, Heart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* TEST: This should show if our changes are working */}
      <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50">
        NEW HOMEPAGE LOADED - {new Date().toLocaleTimeString()}
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-heading-lg font-bold text-gradient-primary">StockMedia Pro</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-body-md text-slate-600 hover:text-primary-600 transition-colors">
                Browse
              </Link>
              <Link href="/pricing" className="text-body-md text-slate-600 hover:text-primary-600 transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-body-md text-slate-600 hover:text-primary-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-body-md text-slate-600 hover:text-primary-600 transition-colors">
                Contact
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="px-4 py-2 text-body-md text-slate-600 hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding-lg pt-32 pb-20">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-accent/10 rounded-full border border-accent-200/50">
                <Sparkles className="w-4 h-4 text-accent-600 mr-2" />
                <span className="text-caption font-medium text-accent-700">AI-Powered Content Discovery</span>
              </div>
              
              <h1 className="text-display-2xl font-bold text-slate-900 leading-tight">
                The Future of
                <span className="text-gradient-primary block">Stock Media</span>
                is Here
              </h1>
              
              <p className="text-body-xl text-slate-600 max-w-lg leading-relaxed">
                Discover, license, and manage premium stock media with AI-powered search, 
                real-time collaboration, and enterprise-grade security. Built for modern creative teams.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 group"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:border-primary-300 hover:text-primary-600 transition-all duration-200 group">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>
              
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="text-body-sm text-slate-600">10,000+ creators</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-body-sm text-slate-600 ml-2">4.9/5 rating</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-square bg-white rounded-2xl shadow-lg flex items-center justify-center">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-accent rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-secondary rounded-full opacity-10 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding-lg bg-slate-50/50">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '2M+', label: 'High-Quality Assets' },
              { number: '500+', label: 'Premium Brands' },
              { number: '99.9%', label: 'Uptime SLA' },
              { number: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-display-lg font-bold text-gradient-primary mb-2">{stat.number}</div>
                <div className="text-body-md text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding-lg">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-display-xl font-bold text-slate-900 mb-4">
              Everything You Need to
              <span className="text-gradient-secondary"> Scale Your Creative Work</span>
            </h2>
            <p className="text-body-xl text-slate-600 max-w-3xl mx-auto">
              From AI-powered discovery to enterprise collaboration, we provide the tools 
              and infrastructure modern creative teams need to succeed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'AI-Powered Search',
                description: 'Find the perfect asset in seconds with our advanced AI that understands context and style.',
                color: 'from-yellow-400 to-orange-500'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-grade security with SOC 2 compliance, SSO, and advanced access controls.',
                color: 'from-blue-400 to-cyan-500'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Real-time collaboration tools with role-based permissions and approval workflows.',
                color: 'from-green-400 to-emerald-500'
              },
              {
                icon: Globe,
                title: 'Global CDN',
                description: 'Lightning-fast delivery worldwide with our edge-optimized content delivery network.',
                color: 'from-purple-400 to-pink-500'
              },
              {
                icon: TrendingUp,
                title: 'Analytics & Insights',
                description: 'Comprehensive analytics to track usage, performance, and ROI across your team.',
                color: 'from-indigo-400 to-blue-500'
              },
              {
                icon: Award,
                title: 'Premium Quality',
                description: 'Curated collection of high-resolution, professional-grade assets from top creators.',
                color: 'from-red-400 to-rose-500'
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-heading-lg font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-body-md text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-padding-lg bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-display-xl font-bold text-slate-900 mb-4">
              Simple, Transparent
              <span className="text-gradient-tertiary"> Pricing</span>
            </h2>
            <p className="text-body-xl text-slate-600 max-w-2xl mx-auto">
              Choose the plan that fits your team size and needs. All plans include our core features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$29',
                period: '/month',
                description: 'Perfect for individual creators and small teams',
                features: [
                  '1,000 downloads/month',
                  'AI-powered search',
                  'Basic collaboration',
                  'Email support',
                  'Standard quality'
                ],
                cta: 'Start Free Trial',
                popular: false
              },
              {
                name: 'Professional',
                price: '$99',
                period: '/month',
                description: 'Ideal for growing creative agencies',
                features: [
                  '10,000 downloads/month',
                  'Advanced AI features',
                  'Team collaboration',
                  'Priority support',
                  'High-res quality',
                  'Analytics dashboard'
                ],
                cta: 'Start Free Trial',
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                description: 'For large organizations with specific needs',
                features: [
                  'Unlimited downloads',
                  'Custom AI training',
                  'Advanced security',
                  'Dedicated support',
                  'Custom integrations',
                  'SLA guarantees'
                ],
                cta: 'Contact Sales',
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`relative ${plan.popular ? 'scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-primary text-white px-4 py-2 rounded-full text-caption font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${plan.popular ? 'border-2 border-primary-200' : 'border border-slate-100'}`}>
                  <div className="text-center mb-8">
                    <h3 className="text-heading-lg font-semibold text-slate-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-display-2xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-body-lg text-slate-600">{plan.period}</span>
                    </div>
                    <p className="text-body-md text-slate-600">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-body-md text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    plan.popular 
                      ? 'bg-gradient-primary text-white hover:shadow-lg hover:scale-105' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}>
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding-lg bg-gradient-primary">
        <div className="container-padding max-w-4xl mx-auto text-center">
          <h2 className="text-display-xl font-bold text-white mb-4">
            Ready to Transform Your
            <span className="text-gradient-secondary"> Creative Workflow?</span>
          </h2>
          <p className="text-body-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who trust StockMedia Pro for their content needs. 
            Start your free trial today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-slate-50 hover:scale-105 transition-all duration-200 group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold hover:border-white/50 hover:bg-white/10 transition-all duration-200"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container-padding max-w-7xl mx-auto py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-heading-lg font-bold">StockMedia Pro</span>
              </div>
              <p className="text-body-md text-slate-400">
                The future of stock media for modern creative teams.
              </p>
            </div>
            
            <div>
              <h3 className="text-heading-sm font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-body-md text-slate-400 hover:text-white transition-colors">Browse</Link></li>
                <li><Link href="/pricing" className="text-body-md text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/features" className="text-body-md text-slate-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/api" className="text-body-md text-slate-400 hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-heading-sm font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-body-md text-slate-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="text-body-md text-slate-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="text-body-md text-slate-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-body-md text-slate-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-heading-sm font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-body-md text-slate-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="text-body-md text-slate-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/status" className="text-body-md text-slate-400 hover:text-white transition-colors">Status</Link></li>
                <li><Link href="/privacy" className="text-body-md text-slate-400 hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-body-sm text-slate-400">
              © 2024 StockMedia Pro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-body-sm text-slate-400 hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="text-body-sm text-slate-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="/cookies" className="text-body-sm text-slate-400 hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}