import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Input,
  Label,
  Typography,
  Badge,
  Separator,
  Skeleton,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui"
import { 
  Search, 
  Download, 
  Heart, 
  Share2, 
  Settings,
  User
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 brand-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <Typography variant="h4" className="brand-text-gradient">
                Stock Media SaaS
              </Typography>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button variant="brand" size="sm">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Typography variant="display" className="mb-6">
            Premium Stock Media
            <br />
            <span className="brand-text-gradient">Made Simple</span>
          </Typography>
          <Typography variant="body-lg" color="muted" className="mb-8 max-w-2xl mx-auto">
            Access millions of high-quality photos, videos, and audio files from top stock media providers. 
            One platform, endless possibilities.
          </Typography>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="brand" className="brand-shadow">
              <Download className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
            <Button size="xl" variant="brand-outline">
              <Search className="h-5 w-5 mr-2" />
              Browse Library
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Typography variant="h2" className="mb-4">
              Why Choose Our Platform?
            </Typography>
            <Typography variant="body-lg" color="muted" className="max-w-2xl mx-auto">
              We've built the most comprehensive stock media platform with features that matter to creators.
            </Typography>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="brand-border hover:brand-shadow transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 brand-gradient rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Smart Search</CardTitle>
                <CardDescription>
                  AI-powered search that understands context and finds exactly what you need.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="brand-border hover:brand-shadow transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 brand-gradient rounded-lg flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Instant Downloads</CardTitle>
                <CardDescription>
                  Download high-resolution files instantly with our optimized CDN.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="brand-border hover:brand-shadow transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 brand-gradient rounded-lg flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Advanced Tools</CardTitle>
                <CardDescription>
                  Professional editing tools and API access for seamless integration.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Component Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Typography variant="h2" className="mb-4">
              Design System Showcase
            </Typography>
            <Typography variant="body-lg" color="muted">
              Our comprehensive component library built for modern web applications.
            </Typography>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
                <CardDescription>Consistent text styles across all components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Typography variant="h1">Heading 1</Typography>
                <Typography variant="h2">Heading 2</Typography>
                <Typography variant="h3">Heading 3</Typography>
                <Typography variant="body">Body text with proper line height</Typography>
                <Typography variant="body-sm" color="muted">Small body text</Typography>
                <Typography variant="caption">Caption text</Typography>
                <Typography color="brand">Brand gradient text</Typography>
              </CardContent>
            </Card>

            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Various button styles and sizes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="brand">Brand</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="brand-outline">Brand Outline</Button>
                  <Button variant="brand" className="brand-shadow">With Shadow</Button>
                </div>
              </CardContent>
            </Card>

            {/* Form Elements */}
            <Card>
              <CardHeader>
                <CardTitle>Form Elements</CardTitle>
                <CardDescription>Input fields and form controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Enter your message" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photos">Photos</SelectItem>
                      <SelectItem value="videos">Videos</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Badges and Status */}
            <Card>
              <CardHeader>
                <CardTitle>Badges & Status</CardTitle>
                <CardDescription>Status indicators and labels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-6 brand-gradient rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SM</span>
                </div>
                <Typography variant="h6">Stock Media</Typography>
              </div>
              <Typography variant="body-sm" color="muted">
                The ultimate platform for stock media creators and consumers.
              </Typography>
            </div>
            <div>
              <Typography variant="h6" className="mb-4">Product</Typography>
              <div className="space-y-2">
                <Typography variant="body-sm" color="muted">Features</Typography>
                <Typography variant="body-sm" color="muted">Pricing</Typography>
                <Typography variant="body-sm" color="muted">API</Typography>
              </div>
            </div>
            <div>
              <Typography variant="h6" className="mb-4">Support</Typography>
              <div className="space-y-2">
                <Typography variant="body-sm" color="muted">Help Center</Typography>
                <Typography variant="body-sm" color="muted">Contact</Typography>
                <Typography variant="body-sm" color="muted">Status</Typography>
              </div>
            </div>
            <div>
              <Typography variant="h6" className="mb-4">Company</Typography>
              <div className="space-y-2">
                <Typography variant="body-sm" color="muted">About</Typography>
                <Typography variant="body-sm" color="muted">Blog</Typography>
                <Typography variant="body-sm" color="muted">Careers</Typography>
              </div>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Typography variant="caption" color="muted">
              © 2024 Stock Media SaaS. All rights reserved.
            </Typography>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}