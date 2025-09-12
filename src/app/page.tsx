export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #e0f2fe 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        fontWeight: 'bold', 
        color: '#1e40af',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        🚀 NEW HOMEPAGE IS WORKING! 🚀
          </h1>
      
            <div style={{
        background: 'red',
                    color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold'
      }}>
        ✅ This proves our changes are being served correctly!
                </div>
                
                <div style={{
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white',
        padding: '1rem',
              borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold'
      }}>
        🎨 Custom gradients and styling are working!
          </div>
          
          <div style={{
                background: 'white',
        padding: '2rem',
                borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#1e40af', marginBottom: '1rem' }}>
          StockMedia Pro - Modern Homepage
            </h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6' }}>
          This is a simplified test to verify our deployment is working correctly.
          If you can see this page, our changes are being served properly!
        </p>
        <button style={{
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
          padding: '12px 24px',
          border: 'none',
                      borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
                      cursor: 'pointer',
          marginTop: '1rem'
        }}>
          Test Button
        </button>
          </div>
          
          <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'green',
                  color: 'white',
        padding: '8px 16px',
        borderRadius: '4px',
              fontSize: '14px',
        fontWeight: 'bold'
      }}>
        DEPLOYMENT TEST - {new Date().toLocaleTimeString()}
        </div>
    </div>
  );
}