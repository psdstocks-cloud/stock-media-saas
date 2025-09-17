import Link from 'next/link';
import { ArrowRight, Play, Star, Check, Zap, Shield, Users, Globe, Sparkles, TrendingUp, Award, Image, Video, Music } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              The Future of Stock Media is Here
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Download premium stock photos, videos, and music with commercial licensing from all major platforms in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="inline-flex items-center px-8 py-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg transition-colors"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/pricing" 
                className="inline-flex items-center px-8 py-4 border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold rounded-lg transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-muted-foreground text-lg">Trusted by creators from</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
            <div className="text-2xl font-bold text-muted-foreground">Shutterstock</div>
            <div className="text-2xl font-bold text-muted-foreground">Getty Images</div>
            <div className="text-2xl font-bold text-muted-foreground">Adobe Stock</div>
            <div className="text-2xl font-bold text-muted-foreground">Unsplash</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Creative Projects
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access millions of high-quality assets from top stock sites with our unified platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card p-8 rounded-xl border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Instant Downloads</h3>
              <p className="text-muted-foreground">
                Get your files immediately after purchase with full commercial licensing included.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card p-8 rounded-xl border">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Secure & Legal</h3>
              <p className="text-muted-foreground">
                All downloads come with proper commercial licensing and usage rights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-8 rounded-xl border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Share points and collaborate with your team on creative projects.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card p-8 rounded-xl border">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                <Image className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">All Media Types</h3>
              <p className="text-muted-foreground">
                Photos, videos, music, and more from all major stock platforms.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card p-8 rounded-xl border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Save Money</h3>
              <p className="text-muted-foreground">
                One platform, multiple sites, better pricing than individual subscriptions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card p-8 rounded-xl border">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Premium Quality</h3>
              <p className="text-muted-foreground">
                Curated selection of high-quality, professional-grade content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Creative Workflow?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who have streamlined their stock media workflow with StockMedia Pro.
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center px-8 py-4 bg-background text-foreground font-semibold rounded-lg hover:bg-background/90 transition-colors"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">StockMedia Pro</h3>
              <p className="text-muted-foreground">
                The unified platform for all your stock media needs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-card-foreground">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-card-foreground">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-card-foreground">Dashboard</Link></li>
                <li><Link href="/about" className="hover:text-card-foreground">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-card-foreground">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/contact" className="hover:text-card-foreground">Contact</Link></li>
                <li><Link href="/dashboard/support" className="hover:text-card-foreground">Help Center</Link></li>
                <li><Link href="/terms" className="hover:text-card-foreground">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-card-foreground">Account</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/login" className="hover:text-card-foreground">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-card-foreground">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 StockMedia Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}