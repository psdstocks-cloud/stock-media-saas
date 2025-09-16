'use client';

import { useState, useEffect } from 'react';

export default function TestAdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        console.log('🔍 Checking admin authentication...');
        
        // First, let's try to access the admin dashboard
        const response = await fetch('/admin', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        console.log('🔍 Admin dashboard response:', response.status);
        
        if (response.status === 200) {
          setAdminUser({ status: 'authenticated', message: 'Admin dashboard accessible' });
        } else if (response.status === 302 || response.status === 307) {
          setError('Redirected to login (not authenticated)');
        } else {
          setError(`Unexpected status: ${response.status}`);
        }
      } catch (err) {
        console.error('🔍 Error checking admin auth:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  const testLoginAndRedirect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🧪 Testing login and redirect flow...');
      
      // Step 1: Login
      const loginResponse = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'admin@stockmedia.com', 
          password: 'AdminSecure2024!' 
        }),
        credentials: 'include',
      });

      console.log('🧪 Login response:', loginResponse.status);
      
      if (!loginResponse.ok) {
        setError('Login failed');
        return;
      }

      // Step 2: Try to access admin dashboard
      const dashboardResponse = await fetch('/admin', {
        method: 'GET',
        credentials: 'include',
      });

      console.log('🧪 Dashboard response:', dashboardResponse.status);
      
      if (dashboardResponse.status === 200) {
        setAdminUser({ status: 'authenticated', message: 'Login successful and dashboard accessible' });
      } else {
        setError(`Dashboard not accessible: ${dashboardResponse.status}`);
      }
    } catch (err) {
      console.error('🧪 Error in login flow:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Testing Admin Dashboard Access</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Admin Dashboard Access Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testLoginAndRedirect}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Login + Dashboard Access'}
        </button>
      </div>

      {adminUser && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          <h3>✅ Success:</h3>
          <pre>{JSON.stringify(adminUser, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          <h3>❌ Error:</h3>
          <p>{error}</p>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>Debug Info:</h3>
        <p>This page tests the complete flow:</p>
        <ol>
          <li>Login via API</li>
          <li>Check if admin dashboard is accessible</li>
          <li>Verify authentication state</li>
        </ol>
      </div>
    </div>
  );
}
