import { auth } from '@/auth'

export default async function TestSession() {
  const session = await auth()
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Session Test</h1>
      <h2>Current Session:</h2>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      
      <h2>Links:</h2>
      <ul>
        <li><a href="/admin">Admin Dashboard</a></li>
        <li><a href="/admin/login">Admin Login</a></li>
        <li><a href="/admin/3d-demo">3D Demo</a></li>
        <li><a href="/dashboard">Regular Dashboard</a></li>
        <li><a href="/login">Regular Login</a></li>
      </ul>
    </div>
  )
}
