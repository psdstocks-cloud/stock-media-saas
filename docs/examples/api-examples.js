/**
 * StockMedia Pro API Examples
 * 
 * This file contains practical examples of how to use the StockMedia Pro API
 * in various programming languages and scenarios.
 */

// ============================================================================
// JAVASCRIPT/TYPESCRIPT EXAMPLES
// ============================================================================

/**
 * Basic API Client Class
 */
class StockMediaAPI {
  constructor(baseUrl, sessionToken) {
    this.baseUrl = baseUrl;
    this.sessionToken = sessionToken;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    };
  }

  /**
   * Get available stock sites
   */
  async getStockSites() {
    const response = await fetch(`${this.baseUrl}/api/stock-sites`);
    return response.json();
  }

  /**
   * Get subscription plans
   */
  async getSubscriptionPlans() {
    const response = await fetch(`${this.baseUrl}/api/subscription-plans`);
    return response.json();
  }

  /**
   * Get user's points balance
   */
  async getPointsBalance() {
    const response = await fetch(`${this.baseUrl}/api/points`, {
      headers: this.headers
    });
    return response.json();
  }

  /**
   * Create a new download order
   */
  async createOrder(orderData) {
    const response = await fetch(`${this.baseUrl}/api/orders`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(orderData)
    });
    return response.json();
  }

  /**
   * Search for stock media
   */
  async searchMedia(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters });
    const response = await fetch(`${this.baseUrl}/api/search?${params}`, {
      headers: this.headers
    });
    return response.json();
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId) {
    const response = await fetch(`${this.baseUrl}/api/orders/${orderId}/status`, {
      headers: this.headers
    });
    return response.json();
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic Setup and Stock Sites
 */
async function example1() {
  const api = new StockMediaAPI(
    'https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app',
    'your-session-token'
  );

  try {
    // Get available stock sites
    const sites = await api.getStockSites();
    console.log('Available stock sites:', sites.stockSites);

    // Get subscription plans
    const plans = await api.getSubscriptionPlans();
    console.log('Subscription plans:', plans.plans);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 2: User Registration and Authentication
 */
async function registerUser() {
  const response = await fetch('https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securepassword123',
      planId: 'cmfb62xtq0000w5bnc9qjc1ly' // Starter plan ID
    })
  });

  const result = await response.json();
  console.log('Registration result:', result);
}

/**
 * Example 3: Creating and Tracking Orders
 */
async function example3() {
  const api = new StockMediaAPI(
    'https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app',
    'your-session-token'
  );

  try {
    // Check points balance
    const balance = await api.getPointsBalance();
    console.log('Current points:', balance.balance);

    // Create an order
    const order = await api.createOrder({
      stockSiteId: 'cmfb0owei00049k8ka5mmdm0k', // Freepik
      itemUrl: 'https://www.freepik.com/free-photo/landscape.jpg',
      itemType: 'PHOTO',
      cost: 0.15
    });

    console.log('Order created:', order.order);

    // Check order status
    const status = await api.getOrderStatus(order.order.id);
    console.log('Order status:', status.order);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 4: Search and Download Workflow
 */
async function searchAndDownload() {
  const api = new StockMediaAPI(
    'https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app',
    'your-session-token'
  );

  try {
    // Search for content
    const searchResults = await api.searchMedia('landscape', {
      type: 'PHOTO',
      site: 'freepik'
    });

    console.log('Search results:', searchResults.results);

    // If we found something, create an order
    if (searchResults.results.length > 0) {
      const item = searchResults.results[0];
      
      const order = await api.createOrder({
        stockSiteId: 'cmfb0owei00049k8ka5mmdm0k', // Freepik
        itemUrl: item.url,
        itemType: 'PHOTO',
        cost: item.cost
      });

      console.log('Order placed for:', item.title);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// REACT COMPONENT EXAMPLES
// ============================================================================

/**
 * React Hook for StockMedia API
 */
import { useState, useEffect } from 'react';

export function useStockMediaAPI(sessionToken) {
  const [api] = useState(() => new StockMediaAPI(
    'https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app',
    sessionToken
  ));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(api);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { api, execute, loading, error };
}

/**
 * React Component for Stock Sites
 */
import React, { useState, useEffect } from 'react';

export function StockSitesList() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/stock-sites');
        const data = await response.json();
        setSites(data.stockSites);
      } catch (error) {
        console.error('Error fetching sites:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSites();
  }, []);

  if (loading) return <div>Loading stock sites...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sites.map(site => (
        <div key={site.id} className="border rounded-lg p-4">
          <h3 className="font-semibold">{site.displayName}</h3>
          <p className="text-gray-600">{site.category}</p>
          <p className="text-blue-600 font-bold">{site.cost} points</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// NODE.JS EXAMPLES
// ============================================================================

/**
 * Node.js Server Example
 */
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// Proxy endpoint for client-side API calls
app.post('/api/proxy/orders', async (req, res) => {
  try {
    const { sessionToken, orderData } = req.body;
    
    const response = await fetch('https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PYTHON EXAMPLES
// ============================================================================

"""
Python API Client Example
"""
import requests
import json

class StockMediaAPIPython:
    def __init__(self, base_url, session_token):
        self.base_url = base_url
        self.session_token = session_token
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {session_token}'
        }

    def get_stock_sites(self):
        response = requests.get(f'{self.base_url}/api/stock-sites')
        return response.json()

    def create_order(self, order_data):
        response = requests.post(
            f'{self.base_url}/api/orders',
            headers=self.headers,
            json=order_data
        )
        return response.json()

    def search_media(self, query, **filters):
        params = {'q': query, **filters}
        response = requests.get(
            f'{self.base_url}/api/search',
            headers=self.headers,
            params=params
        )
        return response.json()

# Usage example
if __name__ == '__main__':
    api = StockMediaAPIPython(
        'https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app',
        'your-session-token'
    )
    
    # Get stock sites
    sites = api.get_stock_sites()
    print('Stock sites:', sites)
    
    # Search for content
    results = api.search_media('landscape', type='PHOTO')
    print('Search results:', results)

// ============================================================================
// ERROR HANDLING EXAMPLES
// ============================================================================

/**
 * Comprehensive Error Handling
 */
async function robustAPICall(apiCall) {
  try {
    const response = await apiCall();
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to API');
    }
    throw error;
  }
}

/**
 * Retry Logic for Failed Requests
 */
async function retryAPICall(apiCall, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

// ============================================================================
// TESTING EXAMPLES
// ============================================================================

/**
 * Jest Test Example
 */
describe('StockMedia API', () => {
  let api;

  beforeEach(() => {
    api = new StockMediaAPI(
      'https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app',
      'test-session-token'
    );
  });

  test('should get stock sites', async () => {
    const sites = await api.getStockSites();
    expect(sites.stockSites).toBeDefined();
    expect(Array.isArray(sites.stockSites)).toBe(true);
  });

  test('should create order with valid data', async () => {
    const orderData = {
      stockSiteId: 'test-site-id',
      itemUrl: 'https://example.com/item',
      itemType: 'PHOTO',
      cost: 0.15
    };

    const order = await api.createOrder(orderData);
    expect(order.order).toBeDefined();
    expect(order.order.id).toBeDefined();
  });
});

// Export for use in other files
export { StockMediaAPI, useStockMediaAPI, StockSitesList };
