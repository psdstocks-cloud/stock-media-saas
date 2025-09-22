import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/jwt-auth';
import OrderHistoryClient from './OrderHistoryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Download, TrendingUp, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Mock data for initial load (in production, this would come from API)
const mockOrders = [
  {
    id: '1',
    title: 'Aerial view of city skyline at sunset',
    stockSite: {
      name: 'shutterstock',
      displayName: 'Shutterstock'
    },
    status: 'completed' as const,
    cost: 10,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    downloadUrl: 'https://example.com/download/1',
    fileName: 'city_skyline_sunset.jpg',
    imageUrl: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=City+Skyline'
  },
  {
    id: '2',
    title: 'Business team meeting in modern office',
    stockSite: {
      name: 'adobestock',
      displayName: 'Adobe Stock'
    },
    status: 'processing' as const,
    cost: 15,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=Business+Meeting'
  },
  {
    id: '3',
    title: 'Abstract geometric pattern background',
    stockSite: {
      name: 'depositphotos',
      displayName: 'Depositphotos'
    },
    status: 'failed' as const,
    cost: 8,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://via.placeholder.com/150x150/EF4444/FFFFFF?text=Abstract+Pattern'
  },
  {
    id: '4',
    title: 'Nature landscape with mountains and lake',
    stockSite: {
      name: 'istockphoto',
      displayName: 'iStock'
    },
    status: 'ready' as const,
    cost: 12,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=Nature+Landscape'
  }
];

export default async function HistoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const session = token ? await verifyJWT(token) : null;

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Page Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Order History</h2>
          <p className="text-white/70">
            Track and manage all your stock media orders
          </p>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total Orders</p>
                <p className="text-3xl font-bold text-white">24</p>
                <p className="text-xs text-green-400 mt-1">+12% from last month</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Completed</p>
                <p className="text-3xl font-bold text-white">18</p>
                <p className="text-xs text-green-400 mt-1">75% success rate</p>
              </div>
              <Download className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total Spent</p>
                <p className="text-3xl font-bold text-white">342</p>
                <p className="text-xs text-orange-400 mt-1">points this month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Processing</p>
                <p className="text-3xl font-bold text-white">3</p>
                <p className="text-xs text-purple-400 mt-1">orders in queue</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Recent Activity */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">Order completed: "Aerial view of city skyline"</p>
                  <p className="text-xs text-white/50">2 hours ago</p>
                </div>
                <span className="text-sm text-green-400 font-medium">10 pts</span>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">Order processing: "Business team meeting"</p>
                  <p className="text-xs text-white/50">1 day ago</p>
                </div>
                <span className="text-sm text-blue-400 font-medium">15 pts</span>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">Order failed: "Abstract geometric pattern"</p>
                  <p className="text-xs text-white/50">3 days ago</p>
                </div>
                <span className="text-sm text-red-400 font-medium">8 pts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History Table */}
        <OrderHistoryClient initialOrders={mockOrders} />
      </div>
    </div>
  );
}
