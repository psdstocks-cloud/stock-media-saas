'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [envData, setEnvData] = useState<any>(null)
  const [tokensData, setTokensData] = useState<any>(null)
  const [loginData, setLoginData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (endpoint: string, setter: (data: any) => void) => {
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      setter(data)
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err)
      setError(`Failed to fetch ${endpoint}`)
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setError(null)
    
    await Promise.all([
      fetchData('/api/debug/env-check', setEnvData),
      fetchData('/api/debug/verification-tokens', setTokensData),
      fetchData('/api/debug/test-admin-login', setLoginData)
    ])
    
    setLoading(false)
  }

  useEffect(() => {
    runAllTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Debug Dashboard</h1>
        
        <div className="mb-6">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Running Tests...' : 'Refresh All Tests'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Environment Check */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🌍 Environment Variables</h2>
            {envData ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${envData.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {envData.success ? '✅ Success' : '❌ Failed'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Critical Issues:</span> 
                  <span className="ml-2">{envData.criticalIssues?.length || 0}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">NEXTAUTH_SECRET:</span> 
                  <span className="ml-2">{envData.environment?.NEXTAUTH_SECRET?.exists ? '✅ Set' : '❌ Missing'}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">DATABASE_URL:</span> 
                  <span className="ml-2">{envData.environment?.DATABASE_URL?.exists ? '✅ Set' : '❌ Missing'}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">RESEND_API_KEY:</span> 
                  <span className="ml-2">{envData.environment?.RESEND_API_KEY?.exists ? '✅ Set' : '❌ Missing'}</span>
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-blue-600">View Full Data</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(envData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="text-gray-500">Loading...</div>
            )}
          </div>

          {/* Verification Tokens */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔑 Verification Tokens</h2>
            {tokensData ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${tokensData.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tokensData.success ? '✅ Success' : '❌ Failed'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Total Tokens:</span> 
                  <span className="ml-2">{tokensData.data?.totalTokens || 0}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Active Tokens:</span> 
                  <span className="ml-2">{tokensData.data?.activeTokens || 0}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Recent Tokens:</span> 
                  <span className="ml-2">{tokensData.data?.recentTokens?.length || 0}</span>
                </div>
                {tokensData.data?.recentTokens?.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Recent Tokens:</div>
                    {tokensData.data.recentTokens.map((token: any, index: number) => (
                      <div key={index} className="text-xs bg-gray-100 p-2 rounded mb-1">
                        <div><strong>Email:</strong> {token.identifier}</div>
                        <div><strong>Token:</strong> {token.token}</div>
                        <div><strong>Expires:</strong> {new Date(token.expires).toLocaleString()}</div>
                        <div><strong>Time Left:</strong> {token.timeUntilExpiry} minutes</div>
                      </div>
                    ))}
                  </div>
                )}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-blue-600">View Full Data</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(tokensData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="text-gray-500">Loading...</div>
            )}
          </div>

          {/* Admin Login Test */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔐 Admin Login Test</h2>
            {loginData ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${loginData.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {loginData.success ? '✅ Success' : '❌ Failed'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Message:</span> 
                  <span className="ml-2">{loginData.message}</span>
                </div>
                {loginData.data?.adminUser && (
                  <div className="text-sm">
                    <span className="font-medium">Admin User:</span> 
                    <span className="ml-2">{loginData.data.adminUser.email} ({loginData.data.adminUser.role})</span>
                  </div>
                )}
                {loginData.data?.verificationToken && (
                  <div className="text-sm">
                    <span className="font-medium">Token Created:</span> 
                    <span className="ml-2">{loginData.data.verificationToken.token}</span>
                  </div>
                )}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-blue-600">View Full Data</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(loginData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="text-gray-500">Loading...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
