import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <span className="text-xl font-bold text-slate-900">StockMedia Pro</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-slate-600 hover:text-slate-900 transition-colors">
                Reviews
              </Link>
              <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">
                Sign In
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <button className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium mb-6">
              🚀 New: AI-Powered Search
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
              The Ultimate
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Stock Media</span>
              <br />Platform
            </h1>
            <p className="text-xl lg:text-2xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Access millions of premium stock photos, videos, and graphics from 500+ top sites worldwide. 
              Download instantly with our point-based system and commercial licensing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/register">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
                  Start Free Trial
                </button>
              </Link>
              <button className="px-8 py-4 border border-slate-300 text-slate-700 text-lg rounded-lg hover:bg-slate-50 transition-all">
                Watch Demo
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1">10M+</div>
                <div className="text-slate-600 font-medium">Media Files</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1">500+</div>
                <div className="text-slate-600 font-medium">Stock Sites</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1">50K+</div>
                <div className="text-slate-600 font-medium">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1">99.9%</div>
                <div className="text-slate-600 font-medium">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Why Choose StockMedia Pro?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We've built the most comprehensive stock media platform with features designed for modern creators and businesses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                🔍
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Smart Search
              </h3>
              <p className="text-slate-600 leading-relaxed">
                AI-powered search across millions of high-quality stock media files
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                ⬇️
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Instant Downloads
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Download your media files instantly with our high-speed CDN
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Lightning Fast
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Optimized for speed with 99.9% uptime and global edge servers
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                🛡️
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Commercial License
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Full commercial rights for all downloads with no attribution required
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                🌍
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Global Access
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Access to premium stock sites worldwide in one unified platform
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                🕐
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                24/7 Support
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Round-the-clock customer support from our expert team
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include commercial licensing and instant downloads.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div key={plan.id} className={`p-8 bg-white rounded-xl shadow-md relative ${index === 1 ? 'ring-2 ring-blue-500 shadow-xl scale-105' : ''}`}>
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 capitalize">
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 text-lg">
                    {plan.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                    <span className="text-slate-600 ml-2">/month</span>
                  </div>
                </div>
                <div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center">
                      <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                      <span className="text-slate-700">{plan.points} points per month</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                      <span className="text-slate-700">{plan.rolloverLimit}% rollover limit</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                      <span className="text-slate-700">Commercial licensing</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                      <span className="text-slate-700">API access</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                      <span className="text-slate-700">24/7 support</span>
                    </li>
                  </ul>
                  <Link href="/register" className="w-full">
                    <button className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      index === 1 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}>
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Creative Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of creators who have already discovered the power of StockMedia Pro. 
            Start your free trial today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <button className="px-8 py-4 bg-white text-blue-600 text-lg rounded-lg hover:bg-blue-50 transition-all">
                Start Free Trial
              </button>
            </Link>
            <button className="px-8 py-4 border border-white text-white text-lg rounded-lg hover:bg-white hover:text-blue-600 transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SM</span>
                </div>
                <span className="text-xl font-bold">StockMedia Pro</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                The ultimate platform for accessing premium stock media from around the world.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 StockMedia Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}