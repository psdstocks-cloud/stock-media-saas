'use client';

import { useState } from 'react';

export default function SimpleAdminTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Testing admin login API...');
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'admin@stockmedia.com', 
          password: 'AdminSecure2024!' 
        }),
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

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Simple Admin Login Test</h1>
      <p>This page tests the admin login API without any complex layouts or providers.</p>
      
      <button 
        onClick={testAPI} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Admin Login API'}
      </button>
      
      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3>Result:</h3>
          <pre style={{ overflow: 'auto', maxHeight: '400px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
