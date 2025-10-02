import { Typography } from "@/components/ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { 
  Users, 
  Target, 
  Heart, 
  Award, 
  Globe, 
  Zap, 
  Calendar,
  MapPin,
  ExternalLink,
  Briefcase,
  TrendingUp,
  Shield,
  Star,
  Clock,
  Building,
  FileText,
  ArrowRight,
  CheckCircle,
  Trophy,
  Medal,
  Certificate
} from "lucide-react"

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

        {/* Company Timeline Section */}
        <section className="mb-16">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            Our Journey
          </Typography>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-orange-500 to-purple-500 rounded-full"></div>
            
            <div className="space-y-12">
              {/* 2020 - Founded */}
              <div className="flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-end mb-3">
                        <Calendar className="h-5 w-5 text-orange-600 mr-2" />
                        <Typography variant="body-sm" className="text-orange-600 font-semibold">
                          January 2020
                        </Typography>
                      </div>
                      <Typography variant="h3" className="text-xl font-bold mb-2">
                        Company Founded
                      </Typography>
                      <Typography variant="body" className="text-muted-foreground">
                        Stock Media SaaS was founded by Ahmed Abdelghany with a vision to democratize 
                        access to premium stock media through innovative pricing models.
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="w-1/2 pl-8"></div>
              </div>

              {/* 2021 - First Funding */}
              <div className="flex items-center">
                <div className="w-1/2 pr-8"></div>
                <div className="w-8 h-8 bg-purple-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div className="w-1/2 pl-8">
                  <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                        <Typography variant="body-sm" className="text-purple-600 font-semibold">
                          March 2021
                        </Typography>
                      </div>
                      <Typography variant="h3" className="text-xl font-bold mb-2">
                        Seed Funding Round
                      </Typography>
                      <Typography variant="body" className="text-muted-foreground">
                        Raised $2M in seed funding to build our core platform and establish 
                        partnerships with major stock media providers.
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 2022 - Platform Launch */}
              <div className="flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-end mb-3">
                        <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                        <Typography variant="body-sm" className="text-blue-600 font-semibold">
                          June 2022
                        </Typography>
                      </div>
                      <Typography variant="h3" className="text-xl font-bold mb-2">
                        Platform Launch
                      </Typography>
                      <Typography variant="body" className="text-muted-foreground">
                        Launched our beta platform with 10 stock media partners and 1,000+ 
                        early adopters. Introduced our revolutionary point-based pricing system.
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div className="w-1/2 pl-8"></div>
              </div>

              {/* 2023 - Series A */}
              <div className="flex items-center">
                <div className="w-1/2 pr-8"></div>
                <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <div className="w-1/2 pl-8">
                  <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Calendar className="h-5 w-5 text-green-600 mr-2" />
                        <Typography variant="body-sm" className="text-green-600 font-semibold">
                          September 2023
                        </Typography>
                      </div>
                      <Typography variant="h3" className="text-xl font-bold mb-2">
                        Series A Funding
                      </Typography>
                      <Typography variant="body" className="text-muted-foreground">
                        Raised $8M Series A to scale operations, expand our partner network to 25+ 
                        platforms, and grow our team to 20+ members.
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 2024 - Current */}
              <div className="flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-end mb-3">
                        <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                        <Typography variant="body-sm" className="text-indigo-600 font-semibold">
                          Present
                        </Typography>
                      </div>
                      <Typography variant="h3" className="text-xl font-bold mb-2">
                        Global Expansion
                      </Typography>
                      <Typography variant="body" className="text-muted-foreground">
                        Serving 10,000+ creators worldwide with 2M+ premium assets across 50+ 
                        stock media platforms. Expanding into new markets and launching AI-powered features.
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-8 h-8 bg-indigo-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div className="w-1/2 pl-8"></div>
              </div>
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

        {/* Awards & Certifications Section */}
        <section className="mb-16">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            Awards & Certifications
          </Typography>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* SOC 2 Type II */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <Typography variant="h3" className="text-lg font-bold mb-2">
                  SOC 2 Type II
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-3">
                  Certified for security, availability, and confidentiality
                </Typography>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Certified
                </Badge>
              </CardContent>
            </Card>

            {/* ISO 27001 */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Certificate className="h-10 w-10 text-white" />
                </div>
                <Typography variant="h3" className="text-lg font-bold mb-2">
                  ISO 27001
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-3">
                  Information security management system certification
                </Typography>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Certified
                </Badge>
              </CardContent>
            </Card>

            {/* Best SaaS Platform 2024 */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <Typography variant="h3" className="text-lg font-bold mb-2">
                  Best SaaS Platform 2024
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-3">
                  Awarded by TechCrunch for innovation in creative tools
                </Typography>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Star className="h-3 w-3 mr-1" />
                  Winner
                </Badge>
              </CardContent>
            </Card>

            {/* GDPR Compliant */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <Typography variant="h3" className="text-lg font-bold mb-2">
                  GDPR Compliant
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-3">
                  Full compliance with European data protection regulations
                </Typography>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Compliant
                </Badge>
              </CardContent>
            </Card>

            {/* Startup of the Year */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Medal className="h-10 w-10 text-white" />
                </div>
                <Typography variant="h3" className="text-lg font-bold mb-2">
                  Startup of the Year 2023
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-3">
                  Recognized by Forbes for disruptive innovation
                </Typography>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  <Star className="h-3 w-3 mr-1" />
                  Winner
                </Badge>
              </CardContent>
            </Card>

            {/* PCI DSS Level 1 */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <Typography variant="h3" className="text-lg font-bold mb-2">
                  PCI DSS Level 1
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-3">
                  Highest level of payment card industry security standards
                </Typography>
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Certified
                </Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Office Culture Section */}
        <section className="mb-16">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            Our Culture
          </Typography>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Typography variant="h3" className="text-2xl font-bold mb-6">
                Remote-First, Values-Driven
              </Typography>
              <Typography variant="body-lg" className="text-muted-foreground mb-6">
                We're a distributed team of 25+ passionate individuals across 12 countries. 
                Our culture is built on trust, transparency, and a shared commitment to empowering creators.
              </Typography>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <Typography variant="body" className="text-muted-foreground">
                    Flexible work hours and unlimited PTO
                  </Typography>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <Typography variant="body" className="text-muted-foreground">
                    Annual team retreats and virtual events
                  </Typography>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <Typography variant="body" className="text-muted-foreground">
                    Learning and development budget for all team members
                  </Typography>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <Typography variant="body" className="text-muted-foreground">
                    Equity participation for all employees
                  </Typography>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 text-center">
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <Typography variant="h4" className="font-bold text-orange-800 mb-1">
                  25+
                </Typography>
                <Typography variant="body-sm" className="text-orange-700">
                  Team Members
                </Typography>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 text-center">
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <Typography variant="h4" className="font-bold text-purple-800 mb-1">
                  12
                </Typography>
                <Typography variant="body-sm" className="text-purple-700">
                  Countries
                </Typography>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 text-center">
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <Typography variant="h4" className="font-bold text-blue-800 mb-1">
                  100%
                </Typography>
                <Typography variant="body-sm" className="text-blue-700">
                  Remote
                </Typography>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 text-center">
                <Heart className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <Typography variant="h4" className="font-bold text-green-800 mb-1">
                  4.9/5
                </Typography>
                <Typography variant="body-sm" className="text-green-700">
                  Team Satisfaction
                </Typography>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            Meet Our Team
          </Typography>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* CEO */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    AS
                  </div>
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">
                    CEO
                  </Badge>
                </div>
                <Typography variant="h3" className="text-xl font-bold mb-2">
                  Ahmed Abdelghany
                </Typography>
                <Typography variant="body-sm" className="text-orange-600 font-semibold mb-3">
                  Founder & CEO
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-4">
                  Serial entrepreneur with 10+ years in SaaS. Previously founded two successful tech companies. 
                  Passionate about democratizing creative tools.
                </Typography>
                <div className="flex justify-center space-x-3">
                  <a href="https://linkedin.com/in/ahmedabdelghany" className="text-blue-600 hover:text-blue-800">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* CTO */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    MJ
                  </div>
                  <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white">
                    CTO
                  </Badge>
                </div>
                <Typography variant="h3" className="text-xl font-bold mb-2">
                  Maria Johnson
                </Typography>
                <Typography variant="body-sm" className="text-purple-600 font-semibold mb-3">
                  Chief Technology Officer
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-4">
                  Full-stack architect with expertise in scalable systems. Former Google engineer. 
                  Leads our technical vision and platform development.
                </Typography>
                <div className="flex justify-center space-x-3">
                  <a href="https://linkedin.com/in/mariajohnson" className="text-blue-600 hover:text-blue-800">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Head of Design */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    SK
                  </div>
                  <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white">
                    Design
                  </Badge>
                </div>
                <Typography variant="h3" className="text-xl font-bold mb-2">
                  Sarah Kim
                </Typography>
                <Typography variant="body-sm" className="text-blue-600 font-semibold mb-3">
                  Head of Design
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-4">
                  Award-winning UX designer with 8+ years experience. Former Apple design team member. 
                  Creates intuitive experiences that users love.
                </Typography>
                <div className="flex justify-center space-x-3">
                  <a href="https://linkedin.com/in/sarahkim" className="text-blue-600 hover:text-blue-800">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Head of Engineering */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    DR
                  </div>
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                    Engineering
                  </Badge>
                </div>
                <Typography variant="h3" className="text-xl font-bold mb-2">
                  David Rodriguez
                </Typography>
                <Typography variant="body-sm" className="text-green-600 font-semibold mb-3">
                  Head of Engineering
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-4">
                  Senior software engineer with expertise in microservices and cloud architecture. 
                  Leads our development team and technical operations.
                </Typography>
                <div className="flex justify-center space-x-3">
                  <a href="https://linkedin.com/in/davidrodriguez" className="text-blue-600 hover:text-blue-800">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Head of Marketing */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    EL
                  </div>
                  <Badge className="absolute -top-2 -right-2 bg-pink-500 text-white">
                    Marketing
                  </Badge>
                </div>
                <Typography variant="h3" className="text-xl font-bold mb-2">
                  Emma Liu
                </Typography>
                <Typography variant="body-sm" className="text-pink-600 font-semibold mb-3">
                  Head of Marketing
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-4">
                  Growth marketing expert with 7+ years in B2B SaaS. Former HubSpot marketing manager. 
                  Drives our user acquisition and retention strategies.
                </Typography>
                <div className="flex justify-center space-x-3">
                  <a href="https://linkedin.com/in/emmaliu" className="text-blue-600 hover:text-blue-800">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Head of Customer Success */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    JT
                  </div>
                  <Badge className="absolute -top-2 -right-2 bg-indigo-500 text-white">
                    Success
                  </Badge>
                </div>
                <Typography variant="h3" className="text-xl font-bold mb-2">
                  James Thompson
                </Typography>
                <Typography variant="body-sm" className="text-indigo-600 font-semibold mb-3">
                  Head of Customer Success
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-4">
                  Customer success veteran with 9+ years experience. Former Salesforce success manager. 
                  Ensures our users achieve their creative goals.
                </Typography>
                <div className="flex justify-center space-x-3">
                  <a href="https://linkedin.com/in/jamesthompson" className="text-blue-600 hover:text-blue-800">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Blog & News Section */}
        <section className="mb-16">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            Latest News & Insights
          </Typography>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <Typography variant="body-sm" className="text-muted-foreground">
                    December 15, 2024
                  </Typography>
                </div>
                <Typography variant="h3" className="text-lg font-bold mb-3">
                  AI-Powered Search: The Future of Stock Media
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-4">
                  Discover how our new AI search technology is revolutionizing how creators find the perfect assets...
                </Typography>
                <Button variant="outline" size="sm" className="w-full">
                  Read More
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  <Typography variant="body-sm" className="text-muted-foreground">
                    December 10, 2024
                  </Typography>
                </div>
                <Typography variant="h3" className="text-lg font-bold mb-3">
                  Q4 2024: Record Growth & New Partnerships
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-4">
                  We're excited to share our Q4 results and announce partnerships with 5 new stock media platforms...
                </Typography>
                <Button variant="outline" size="sm" className="w-full">
                  Read More
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-5 w-5 text-purple-600 mr-2" />
                  <Typography variant="body-sm" className="text-muted-foreground">
                    December 5, 2024
                  </Typography>
                </div>
                <Typography variant="h3" className="text-lg font-bold mb-3">
                  Creator Spotlight: How Sarah Built Her Brand
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground mb-4">
                  Learn how graphic designer Sarah used our platform to build her freelance business from scratch...
                </Typography>
                <Button variant="outline" size="sm" className="w-full">
                  Read More
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
              View All Articles
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>

        {/* Careers Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12">
            <div className="text-center mb-8">
              <Typography variant="h2" className="text-3xl font-bold mb-4">
                Join Our Team
              </Typography>
              <Typography variant="body-lg" className="text-muted-foreground max-w-2xl mx-auto">
                We're always looking for talented individuals who share our passion for empowering creators. 
                Join our remote-first team and help us build the future of stock media.
              </Typography>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <Typography variant="h4" className="font-bold mb-2">
                  8
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground">
                  Open Positions
                </Typography>
              </div>
              <div className="text-center">
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <Typography variant="h4" className="font-bold mb-2">
                  12
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground">
                  Countries
                </Typography>
              </div>
              <div className="text-center">
                <Heart className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <Typography variant="h4" className="font-bold mb-2">
                  4.9/5
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground">
                  Employee Rating
                </Typography>
              </div>
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <Typography variant="h4" className="font-bold mb-2">
                  100%
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground">
                  Remote Work
                </Typography>
              </div>
            </div>
            <div className="text-center">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white mr-4">
                View Open Positions
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline">
                Learn About Our Culture
              </Button>
            </div>
          </div>
        </section>

        {/* Investor Information Section */}
        <section className="mb-16">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            Investor Information
          </Typography>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Typography variant="h3" className="text-2xl font-bold mb-6">
                Our Investors
              </Typography>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Typography variant="h4" className="font-bold">
                      Sequoia Capital
                    </Typography>
                    <Typography variant="body-sm" className="text-muted-foreground">
                      Series A Lead Investor
                    </Typography>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Lead
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Typography variant="h4" className="font-bold">
                      Andreessen Horowitz
                    </Typography>
                    <Typography variant="body-sm" className="text-muted-foreground">
                      Seed & Series A Participant
                    </Typography>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    Participant
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Typography variant="h4" className="font-bold">
                      Y Combinator
                    </Typography>
                    <Typography variant="body-sm" className="text-muted-foreground">
                      Accelerator Program
                    </Typography>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    Accelerator
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h3" className="text-2xl font-bold mb-6">
                Financial Highlights
              </Typography>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <Typography variant="body" className="font-semibold">
                    Total Funding Raised
                  </Typography>
                  <Typography variant="h4" className="font-bold text-green-600">
                    $10M
                  </Typography>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <Typography variant="body" className="font-semibold">
                    Annual Recurring Revenue
                  </Typography>
                  <Typography variant="h4" className="font-bold text-blue-600">
                    $2.5M
                  </Typography>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <Typography variant="body" className="font-semibold">
                    Customer Growth (YoY)
                  </Typography>
                  <Typography variant="h4" className="font-bold text-purple-600">
                    +150%
                  </Typography>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <Typography variant="body" className="font-semibold">
                    Revenue Growth (YoY)
                  </Typography>
                  <Typography variant="h4" className="font-bold text-orange-600">
                    +200%
                  </Typography>
                </div>
              </div>
              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  Download Investor Deck
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
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

