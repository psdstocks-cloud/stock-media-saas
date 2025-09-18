'use client';

import { useEffect, useState } from 'react';

export default function CSSTestPage() {
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    setMounted(true);
    
    // Collect debug information
    const info = {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Server',
      cssSheets: typeof document !== 'undefined' ? Array.from(document.styleSheets).map(sheet => ({
        href: sheet.href,
        rules: sheet.cssRules?.length || 0,
        disabled: sheet.disabled
      })) : [],
      computedStyles: typeof window !== 'undefined' ? {
        primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--primary'),
        secondaryColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary'),
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background'),
        foregroundColor: getComputedStyle(document.documentElement).getPropertyValue('--foreground'),
      } : {},
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        vercelUrl: process.env.VERCEL_URL,
        nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      }
    };
    
    setDebugInfo(info);
    
    // Log to console for debugging
    console.log('🔍 CSS Test Debug Info:', info);
  }, []);

  if (!mounted) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>CSS Test Page - Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            CSS Loading Diagnostic Test
          </h1>
          <p className="text-muted-foreground">
            This page tests if CSS variables and Tailwind classes are working properly
          </p>
        </div>

        {/* CSS Variables Test */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
            CSS Variables Test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div 
                className="w-full h-16 rounded"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
              />
              <p className="text-sm text-muted-foreground">Primary Color</p>
              <p className="text-xs font-mono">{debugInfo.computedStyles?.primaryColor || 'Not found'}</p>
            </div>
            <div className="space-y-2">
              <div 
                className="w-full h-16 rounded"
                style={{ backgroundColor: 'hsl(var(--secondary))' }}
              />
              <p className="text-sm text-muted-foreground">Secondary Color</p>
              <p className="text-xs font-mono">{debugInfo.computedStyles?.secondaryColor || 'Not found'}</p>
            </div>
            <div className="space-y-2">
              <div 
                className="w-full h-16 rounded border"
                style={{ backgroundColor: 'hsl(var(--background))' }}
              />
              <p className="text-sm text-muted-foreground">Background Color</p>
              <p className="text-xs font-mono">{debugInfo.computedStyles?.backgroundColor || 'Not found'}</p>
            </div>
            <div className="space-y-2">
              <div 
                className="w-full h-16 rounded"
                style={{ backgroundColor: 'hsl(var(--foreground))' }}
              />
              <p className="text-sm text-muted-foreground">Foreground Color</p>
              <p className="text-xs font-mono">{debugInfo.computedStyles?.foregroundColor || 'Not found'}</p>
            </div>
          </div>
        </div>

        {/* Tailwind Classes Test */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
            Tailwind Classes Test
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">
                Primary Button
              </button>
              <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90">
                Secondary Button
              </button>
              <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded hover:bg-destructive/90">
                Destructive Button
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded">
                <h3 className="font-semibold text-muted-foreground">Muted Card</h3>
                <p className="text-sm">This should have muted background and text colors</p>
              </div>
              <div className="bg-accent p-4 rounded">
                <h3 className="font-semibold text-accent-foreground">Accent Card</h3>
                <p className="text-sm">This should have accent background and text colors</p>
              </div>
              <div className="bg-popover p-4 rounded border">
                <h3 className="font-semibold text-popover-foreground">Popover Card</h3>
                <p className="text-sm">This should have popover background and text colors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Typography Test */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
            Typography Test
          </h2>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Heading 1 - 4xl Bold</h1>
            <h2 className="text-3xl font-semibold text-foreground">Heading 2 - 3xl Semibold</h2>
            <h3 className="text-2xl font-medium text-foreground">Heading 3 - 2xl Medium</h3>
            <p className="text-base text-muted-foreground">
              This is a paragraph with base text size and muted foreground color.
              It should be clearly visible and properly styled.
            </p>
            <p className="text-sm text-muted-foreground">
              This is smaller text with muted foreground color for secondary information.
            </p>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
            Debug Information
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">Environment Variables:</h3>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(debugInfo.environment, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">CSS Sheets Loaded:</h3>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(debugInfo.cssSheets, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">Computed CSS Variables:</h3>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(debugInfo.computedStyles, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">Page Info:</h3>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify({
                  timestamp: debugInfo.timestamp,
                  url: debugInfo.url,
                  userAgent: debugInfo.userAgent?.substring(0, 100) + '...'
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Manual CSS Test */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
            Manual CSS Test
          </h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              If the above elements don't look styled, try these manual tests:
            </p>
            
            <div className="space-y-2">
              <div 
                className="w-full h-8 rounded"
                style={{ 
                  backgroundColor: '#4c1d95', // Dark purple
                  color: 'white',
                  padding: '4px 8px',
                  fontSize: '14px'
                }}
              >
                Manual Dark Purple Background
              </div>
              
              <div 
                className="w-full h-8 rounded"
                style={{ 
                  backgroundColor: '#ea580c', // Vibrant orange
                  color: 'white',
                  padding: '4px 8px',
                  fontSize: '14px'
                }}
              >
                Manual Vibrant Orange Background
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              If you see the manual colors above but not the CSS variable colors, 
              then the CSS variables are not being loaded properly.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">What to Look For:</h2>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Colors should be visible:</strong> Dark purple, vibrant orange, proper background/foreground</li>
            <li>• <strong>Buttons should be styled:</strong> Proper colors, hover effects, rounded corners</li>
            <li>• <strong>Typography should be styled:</strong> Proper font sizes, weights, and colors</li>
            <li>• <strong>Cards should have:</strong> Background colors, borders, proper spacing</li>
            <li>• <strong>CSS Variables should show values:</strong> Not "Not found" in the debug info</li>
            <li>• <strong>CSS Sheets should be loaded:</strong> Multiple stylesheets in debug info</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
