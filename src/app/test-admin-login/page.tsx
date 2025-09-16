'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAdminLoginPage() {
  const [email, setEmail] = useState('admin@stockmedia.com');
  const [password, setPassword] = useState('AdminSecure2024!');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Testing admin login API...');
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('🧪 API Response:', { status: response.status, data });
      
      setResult({ status: response.status, data });
    } catch (error) {
      console.error('🧪 Test error:', error);
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testDebugAPI = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Testing debug admin API...');
      const response = await fetch('/api/debug/admin-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('🧪 Debug API Response:', { status: response.status, data });
      
      setResult({ status: response.status, data, source: 'debug-api' });
    } catch (error) {
      console.error('🧪 Debug test error:', error);
      setResult({ error: error instanceof Error ? error.message : 'Unknown error', source: 'debug-api' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Admin Login API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testLogin} disabled={loading} className="flex-1">
              {loading ? 'Testing...' : 'Test Login API'}
            </Button>
            <Button onClick={testDebugAPI} disabled={loading} variant="outline" className="flex-1">
              {loading ? 'Testing...' : 'Test Debug API'}
            </Button>
          </div>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold">Result:</h3>
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
