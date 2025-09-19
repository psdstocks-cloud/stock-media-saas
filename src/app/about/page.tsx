import { Typography } from "@/components/ui"
import { Users, Target, Heart, Award, Globe, Zap } from "lucide-react"

export default function AboutPage() {
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
                About Us
              </Typography>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Typography variant="h1" className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Stock Media SaaS</span>
          </Typography>
          <Typography variant="h3" className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            We're revolutionizing how creators access premium stock media with our innovative point-based system.
          </Typography>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Typography variant="h2" className="text-3xl font-bold mb-6">
                Our Mission
              </Typography>
              <Typography variant="body-lg" className="text-muted-foreground mb-6">
                We believe that creativity shouldn't be limited by complex subscription models or expensive licensing fees. 
                Our mission is to democratize access to premium stock media by providing a simple, transparent, 
                and affordable point-based system.
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Whether you're a solo creator, a growing agency, or a large enterprise, we provide the tools and 
                content you need to bring your creative vision to life without breaking the bank.
              </Typography>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-orange-100 rounded-2xl p-8">
              <div className="flex items-center justify-center h-64">
                <Target className="h-32 w-32 text-orange-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            Our Values
          </Typography>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <Typography variant="h3" className="text-xl font-bold mb-4">
                Creator-First
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                We put creators at the center of everything we do. Every feature, every decision is made 
                with our community's success in mind.
              </Typography>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <Typography variant="h3" className="text-xl font-bold mb-4">
                Innovation
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                We're constantly pushing boundaries to deliver cutting-edge tools and seamless experiences 
                that make creative work more efficient.
              </Typography>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <Typography variant="h3" className="text-xl font-bold mb-4">
                Accessibility
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Premium quality content should be accessible to everyone, regardless of budget or location. 
                We're breaking down barriers to creative expression.
              </Typography>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-orange-100 to-purple-100 rounded-2xl p-8">
              <div className="flex items-center justify-center h-64">
                <Users className="h-32 w-32 text-purple-500" />
              </div>
            </div>
            <div>
              <Typography variant="h2" className="text-3xl font-bold mb-6">
                Our Story
              </Typography>
              <Typography variant="body-lg" className="text-muted-foreground mb-6">
                Stock Media SaaS was born out of frustration with traditional stock media platforms. 
                Our founders, experienced creators themselves, were tired of expensive subscriptions, 
                confusing licensing terms, and limited access to quality content.
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                We set out to create a platform that would give creators the freedom to access premium 
                content on their terms, with transparent pricing and no hidden fees. Today, we're proud 
                to serve thousands of creators worldwide with our innovative approach.
              </Typography>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            By the Numbers
          </Typography>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Typography variant="h1" className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                2M+
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Premium Assets
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="h1" className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                10K+
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Active Creators
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="h1" className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                50+
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Stock Sites
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="h1" className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                24/7
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Availability
              </Typography>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            Meet Our Team
          </Typography>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-200 to-purple-200 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-16 w-16 text-orange-600" />
              </div>
              <Typography variant="h3" className="text-xl font-bold mb-2">
                Creative Team
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Our talented designers and developers work tirelessly to create the best possible 
                experience for our users.
              </Typography>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-200 to-blue-200 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <Award className="h-16 w-16 text-purple-600" />
              </div>
              <Typography variant="h3" className="text-xl font-bold mb-2">
                Quality Assurance
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Our QA team ensures that every asset meets our high standards for quality and 
                every feature works flawlessly.
              </Typography>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-200 to-orange-200 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <Heart className="h-16 w-16 text-blue-600" />
              </div>
              <Typography variant="h3" className="text-xl font-bold mb-2">
                Customer Success
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Our support team is here to help you succeed with personalized assistance and 
                expert guidance.
              </Typography>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl p-12">
          <Typography variant="h2" className="text-3xl font-bold mb-6">
            Ready to Join Our Community?
          </Typography>
          <Typography variant="body-lg" className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Become part of a growing community of creators who are revolutionizing how we access 
            and use stock media. Start your creative journey with us today.
          </Typography>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register" 
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              Get Started Free
            </a>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Contact Us
            </a>
          </div>
        </section>
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

