'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Star, Check, Zap, Shield, Users, Globe, Sparkles, TrendingUp, Award, Image, Video, Music } from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="bg-card p-8 rounded-xl shadow-lg text-center">
          <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading StockMedia Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .fade-in-up { animation: fadeInUp 0.6s ease-out; }
        .float { animation: float 3s ease-in-out infinite; }
        .gradient-animated {
          background: linear-gradient(-45deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)), hsl(var(--accent)));
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }
        .marquee {
          animation: marquee 30s linear infinite;
        }
        .marquee:hover {
          animation-play-state: paused;
        }
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles size={20} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                StockMedia Pro
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/dashboard/download" className="text-muted-foreground hover:text-foreground transition-colors">Download</Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2">Sign In</Link>
              <Link href="/register" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section with Animated Gradient */}
        <section className="relative pt-24 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 gradient-animated opacity-10"></div>
          <div className="max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                  <Sparkles size={16} className="text-primary" />
                  <span className="text-sm font-medium text-primary">AI-Powered Content Discovery</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  The Future of<br />
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Stock Media</span><br />
                  is Here
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  Discover, license, and manage premium stock media with AI-powered search, 
                  real-time collaboration, and enterprise-grade security. Built for modern creative teams.
                </p>
                
                <div className="flex gap-4 flex-wrap">
                  <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/90 transition-all hover:scale-105 shadow-lg">
                    Start Free Trial
                    <ArrowRight size={20} />
                  </Link>
                  <button className="inline-flex items-center gap-2 px-8 py-4 border border-border rounded-xl font-semibold hover:bg-muted transition-colors">
                    <Play size={20} />
                    Watch Demo
                  </button>
                </div>
                
                <div className="flex items-center gap-8 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full border-2 border-background"></div>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">10,000+ creators</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">4.9/5 rating</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border/50 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Image, label: 'Photos' },
                      { icon: Video, label: 'Videos' },
                      { icon: Music, label: 'Audio' },
                      { icon: Sparkles, label: 'AI Search' }
                    ].map((item, i) => (
                      <div key={i} className="aspect-square bg-background rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                          <item.icon size={24} className="text-primary-foreground" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-secondary to-accent rounded-full opacity-20 float"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-primary to-secondary rounded-full opacity-10 float" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Marquee */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-muted-foreground mb-4">Trusted by creators worldwide</h2>
              <p className="text-muted-foreground">Access premium content from leading stock sites</p>
            </div>
            
            <div className="relative overflow-hidden">
              <div className="flex marquee">
                {[
                  'Shutterstock', 'Getty Images', 'Adobe Stock', 'Unsplash', 'Pexels', 
                  'Pixabay', 'Freepik', 'Depositphotos', '123RF', 'Dreamstime',
                  'iStock', 'Alamy', 'Canva', 'Envato', 'Storyblocks'
                ].map((site, i) => (
                  <div key={i} className="flex-shrink-0 mx-8 flex items-center justify-center">
                    <div className="bg-background px-6 py-3 rounded-lg border border-border/50 shadow-sm">
                      <span className="font-medium text-muted-foreground">{site}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: '2M+', label: 'High-Quality Assets' },
                { number: '500+', label: 'Premium Brands' },
                { number: '99.9%', label: 'Uptime SLA' },
                { number: '24/7', label: 'Support' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section with Bento Grid */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Everything You Need to<br />
                <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  Scale Your Creative Work
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From AI-powered discovery to enterprise collaboration, we provide the tools 
                and infrastructure modern creative teams need to succeed.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Large Feature Card */}
              <div className="lg:col-span-2 lg:row-span-2 bg-card rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-2xl flex items-center justify-center mb-6">
                  <Zap size={32} className="text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">AI-Powered Search</h3>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  Find the perfect asset in seconds with our advanced AI that understands context, style, and composition. 
                  Our machine learning algorithms learn from your preferences to deliver increasingly relevant results.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </div>
              </div>

              {/* Regular Feature Cards */}
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mb-4">
                  <Shield size={24} className="text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Enterprise Security</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Bank-grade security with SOC 2 compliance, SSO, and advanced access controls.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Users size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Team Collaboration</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Real-time collaboration tools with role-based permissions and approval workflows.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <Globe size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Global CDN</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Lightning-fast delivery worldwide with our edge-optimized content delivery network.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Analytics & Insights</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Comprehensive analytics to track usage, performance, and ROI across your team.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <Award size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Premium Quality</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Curated collection of high-resolution, professional-grade assets from top creators.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 bg-gradient-to-r from-primary to-secondary overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your<br />
              <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                Creative Workflow?
              </span>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who trust StockMedia Pro for their content needs. 
              Start your free trial today and experience the difference.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-background text-foreground rounded-xl font-semibold hover:bg-background/90 transition-colors shadow-lg">
                Start Free Trial
                <ArrowRight size={20} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors">
                Talk to Sales
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                    <Sparkles size={20} className="text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold">StockMedia Pro</span>
                </div>
                <p className="text-muted-foreground">
                  The future of stock media for modern creative teams.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <div className="space-y-2">
                  <Link href="/dashboard/download" className="block text-muted-foreground hover:text-foreground transition-colors">Download</Link>
                  <Link href="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                  <Link href="/features" className="block text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                  <Link href="/api" className="block text-muted-foreground hover:text-foreground transition-colors">API</Link>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <div className="space-y-2">
                  <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">About</Link>
                  <Link href="/careers" className="block text-muted-foreground hover:text-foreground transition-colors">Careers</Link>
                  <Link href="/blog" className="block text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                  <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <div className="space-y-2">
                  <Link href="/dashboard/support" className="block text-muted-foreground hover:text-foreground transition-colors">Support Hub</Link>
                  <Link href="/dashboard/support?tab=faq" className="block text-muted-foreground hover:text-foreground transition-colors">FAQ & Help</Link>
                  <Link href="/dashboard/support?tab=contact" className="block text-muted-foreground hover:text-foreground transition-colors">Submit Ticket</Link>
                  <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 StockMedia Pro. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}