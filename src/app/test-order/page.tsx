'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestOrderPage() {
  const [testUrl, setTestUrl] = useState('https://www.dreamstime.com/freelance-people-work-comfortable-conditions-set-vector-flat-illustration-freelancer-character-working-home-freelance-image169271221');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testStockInfo = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing stock-info API...');
      console.log('URL being sent:', testUrl);
      const response = await fetch(`/api/stock-info?url=${encodeURIComponent(testUrl)}`);
      const data = await response.json();
      
      console.log('Stock-info response:', data);
      setResult({ type: 'stock-info', data, status: response.status });
    } catch (err) {
      console.error('Stock-info error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testPlaceOrder = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing place-order API...');
      
      // First get a test auth token
      const authResponse = await fetch('/api/test-auth');
      const authData = await authResponse.json();
      
      if (!authData.success) {
        throw new Error('Failed to get test auth token');
      }
      
      const orderPayload = [{
        url: testUrl,
        site: 'dreamstime',
        id: '169271221',
        title: 'Test Order',
        cost: 0.65,
        imageUrl: 'https://thumbs.dreamstime.com/l/freelance-people-work-comfortable-conditions-set-vector-flat-illustration-freelancer-character-working-home-freelance-169271221.jpg'
      }];

      const headers: Record<string, string> = { 
        'Content-Type': 'application/json',
        'Cookie': `token=${authData.token}`,
        'Authorization': `Bearer ${authData.token}`
      };

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
      });
      
      const data = await response.json();
      console.log('Place-order response:', data);
      setResult({ type: 'place-order', data, status: response.status });
    } catch (err) {
      console.error('Place-order error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testImageLoad = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing image load...');
      const imageUrl = 'https://thumbs.dreamstime.com/l/freelance-people-work-comfortable-conditions-set-vector-flat-illustration-freelancer-character-working-home-freelance-169271221.jpg';
      
      // Use proxy to avoid CORS issues
      console.log('Using proxy to load image...');
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const proxyResponse = await fetch(proxyUrl);
      
      if (!proxyResponse.ok) {
        throw new Error(`Proxy failed: ${proxyResponse.status} ${proxyResponse.statusText}`);
      }
      
      const proxyBlob = await proxyResponse.blob();
      
      console.log('Proxy image load successful:', proxyResponse.status);
      setResult({ 
        type: 'image-load', 
        status: proxyResponse.status, 
        statusText: proxyResponse.statusText,
        size: proxyBlob.size,
        mimeType: proxyBlob.type,
        url: imageUrl,
        method: 'proxy'
      });
    } catch (err) {
      console.error('Image load error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Still set result with error info
      setResult({ 
        type: 'image-load', 
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        url: 'https://thumbs.dreamstime.com/l/freelance-people-work-comfortable-conditions-set-vector-flat-illustration-freelancer-character-working-home-freelance-169271221.jpg'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Order API Test Page</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test URL</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter stock media URL"
          />
          <div className="flex gap-2">
            <Button onClick={testStockInfo} disabled={loading}>
              Test Stock Info API
            </Button>
            <Button onClick={testPlaceOrder} disabled={loading}>
              Test Place Order API
            </Button>
            <Button onClick={testImageLoad} disabled={loading}>
              Test Image Load
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-red-500">
          <CardContent className="p-4">
            <div className="text-red-600 font-semibold">Error:</div>
            <div className="text-red-500">{error}</div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Result: {result.type}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <strong>Status:</strong> {result.status} {result.statusText || ''}
            </div>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
