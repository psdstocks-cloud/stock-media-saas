'use client'

import React from 'react'
import { Button, Typography } from '@/components/ui'
import { Heart, Share2, Twitter, Linkedin, Github, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <Typography variant="h5" className="text-white font-bold">
                Stock Media SaaS
              </Typography>
            </div>
            <Typography variant="body" className="text-gray-300 mb-6 leading-relaxed">
              The ultimate platform for stock media creators and consumers. 
              Access millions of premium assets with our revolutionary point-based system.
            </Typography>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <Typography variant="h6" className="text-white font-semibold mb-6">
              Product
            </Typography>
            <div className="space-y-3">
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Features
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Pricing
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                API Documentation
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Integrations
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Changelog
              </Button>
            </div>
          </div>

          {/* Support Links */}
          <div>
            <Typography variant="h6" className="text-white font-semibold mb-6">
              Support
            </Typography>
            <div className="space-y-3">
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Help Center
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Contact Support
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Status Page
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Community Forum
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Bug Reports
              </Button>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <Typography variant="h6" className="text-white font-semibold mb-6">
              Company
            </Typography>
            <div className="space-y-3">
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                About Us
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Blog
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Careers
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Press Kit
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white justify-start p-0 h-auto">
                Partners
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <Typography variant="body-sm" className="text-gray-400">
                © 2024 Stock Media SaaS. All rights reserved.
              </Typography>
              <div className="flex space-x-6">
                <Button variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                  Privacy Policy
                </Button>
                <Button variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                  Terms of Service
                </Button>
                <Button variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                  Cookie Policy
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
