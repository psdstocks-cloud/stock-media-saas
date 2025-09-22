'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestSimplePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testUrl = 'https://www.dreamstime.com/freelance-people-work-comfortable-conditions-set-vector-flat-illustration-freelancer-character-working-home-freelance-image169271221';

  const testDirect = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing direct API call...');
      console.log('URL:', testUrl);
      console.log('Encoded URL:', encodeURIComponent(testUrl));
      
      const response = await fetch(`/api/stock-info?url=${encodeURIComponent(testUrl)}`);
      const data = await response.json();
      
      console.log('Response:', data);
      setResult({ data, status: response.status });
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Simple API Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <strong>Original URL:</strong>
            <div className="text-sm text-gray-600 break-all">{testUrl}</div>
          </div>
          <div className="mb-4">
            <strong>Encoded URL:</strong>
            <div className="text-sm text-gray-600 break-all">{encodeURIComponent(testUrl)}</div>
          </div>
          <Button onClick={testDirect} disabled={loading}>
            {loading ? 'Testing...' : 'Test Direct API Call'}
          </Button>
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
            <CardTitle>Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <strong>Status:</strong> {result.status}
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
