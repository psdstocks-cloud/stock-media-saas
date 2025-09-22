'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function TestImagePage() {
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop');
  const [error, setError] = useState<string | null>(null);

  const handleImageError = (e: any) => {
    console.error('Image load error:', e);
    setError('Failed to load image');
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setError(null);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Image Test Page</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Image URL:</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <button
          onClick={() => {
            setError(null);
            // Force reload by changing the key
            setImageUrl(imageUrl + '?t=' + Date.now());
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Reload Image
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="border p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Next.js Image Component:</h2>
        <Image
          src={imageUrl}
          alt="Test image"
          width={200}
          height={200}
          className="rounded"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>

      <div className="mt-4 border p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Regular img tag:</h2>
        <img
          src={imageUrl}
          alt="Test image"
          width={200}
          height={200}
          className="rounded"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
    </div>
  );
}
