# StockMedia Pro API Documentation

## Overview

StockMedia Pro provides a RESTful API for managing stock media downloads, user subscriptions, and point-based transactions. The API is built with Next.js 14 and uses PostgreSQL as the database.

**Base URL:** `https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app`

## Authentication

The API uses NextAuth.js for authentication. Most endpoints require authentication via session cookies.

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "planId": "plan_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User
```http
POST /api/auth/[...nextauth]
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Logout User
```http
POST /api/auth/logout
```

## Subscription Plans

#### Get Available Plans
```http
GET /api/subscription-plans
```

**Response:**
```json
{
  "plans": [
    {
      "id": "plan_id",
      "name": "starter",
      "description": "Perfect for individuals and small projects",
      "price": 9.99,
      "points": 50,
      "rolloverLimit": 25
    }
  ]
}
```

#### Get User Subscription
```http
GET /api/subscription
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "subscription": {
    "id": "sub_id",
    "plan": {
      "name": "professional",
      "price": 29.99,
      "points": 200
    },
    "status": "ACTIVE",
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-01-31T00:00:00Z"
  }
}
```

## Stock Sites

#### Get Available Stock Sites
```http
GET /api/stock-sites
```

**Response:**
```json
{
  "stockSites": [
    {
      "id": "site_id",
      "name": "freepik",
      "displayName": "Freepik",
      "cost": 0.15,
      "isActive": true,
      "category": "photos"
    }
  ]
}
```

## Points Management

#### Get Points Balance
```http
GET /api/points
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "balance": 150,
  "history": [
    {
      "id": "transaction_id",
      "amount": 200,
      "type": "SUBSCRIPTION",
      "description": "Monthly subscription points",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Add Points (Admin Only)
```http
POST /api/points
Authorization: Bearer <admin_session_token>
Content-Type: application/json

{
  "userId": "user_id",
  "amount": 100,
  "type": "BONUS",
  "description": "Welcome bonus"
}
```

## Orders

#### Create Order
```http
POST /api/orders
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "stockSiteId": "site_id",
  "itemUrl": "https://example.com/item",
  "itemType": "PHOTO",
  "cost": 0.15
}
```

**Response:**
```json
{
  "order": {
    "id": "order_id",
    "status": "PENDING",
    "cost": 0.15,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Order Status
```http
GET /api/orders/{orderId}/status
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "order": {
    "id": "order_id",
    "status": "COMPLETED",
    "downloadUrl": "https://download.example.com/file.zip",
    "completedAt": "2024-01-01T00:05:00Z"
  }
}
```

#### Get User Orders
```http
GET /api/orders
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "orders": [
    {
      "id": "order_id",
      "stockSite": {
        "name": "freepik",
        "displayName": "Freepik"
      },
      "status": "COMPLETED",
      "cost": 0.15,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Search

#### Search Stock Media
```http
GET /api/search?q=landscape&type=photo&site=freepik
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "results": [
    {
      "id": "item_id",
      "title": "Beautiful Landscape",
      "url": "https://example.com/item",
      "thumbnail": "https://example.com/thumb.jpg",
      "cost": 0.15,
      "site": "freepik"
    }
  ]
}
```

## Stripe Integration

#### Create Checkout Session
```http
POST /api/stripe/checkout
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "planId": "plan_id",
  "successUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_..."
}
```

#### Create Customer Portal Session
```http
POST /api/stripe/portal
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "returnUrl": "https://yourapp.com/dashboard"
}
```

**Response:**
```json
{
  "portalUrl": "https://billing.stripe.com/p/session_..."
}
```

## Admin Endpoints

#### Get All Users (Admin Only)
```http
GET /api/admin/users
Authorization: Bearer <admin_session_token>
```

#### Get All Orders (Admin Only)
```http
GET /api/admin/orders
Authorization: Bearer <admin_session_token>
```

#### Update System Settings (Admin Only)
```http
PUT /api/admin/settings
Authorization: Bearer <admin_session_token>
Content-Type: application/json

{
  "maintenanceMode": false,
  "maxPointsPerMonth": 1000
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- **General API calls:** 100 requests per minute per user
- **Search requests:** 50 requests per minute per user
- **Order creation:** 10 requests per minute per user

## Webhooks

### Stripe Webhooks

The application listens for the following Stripe webhook events:

- `checkout.session.completed` - When a subscription is created
- `customer.subscription.updated` - When a subscription is modified
- `customer.subscription.deleted` - When a subscription is cancelled
- `invoice.payment_succeeded` - When a payment is successful
- `invoice.payment_failed` - When a payment fails

**Webhook Endpoint:** `POST /api/stripe/webhook`

### Nehtw.com Webhooks

The application listens for download completion notifications:

**Webhook Endpoint:** `POST /api/webhooks/nehtw`

## SDK Examples

### JavaScript/TypeScript

```typescript
class StockMediaAPI {
  private baseUrl: string;
  private sessionToken: string;

  constructor(baseUrl: string, sessionToken: string) {
    this.baseUrl = baseUrl;
    this.sessionToken = sessionToken;
  }

  async getStockSites() {
    const response = await fetch(`${this.baseUrl}/api/stock-sites`);
    return response.json();
  }

  async createOrder(stockSiteId: string, itemUrl: string, cost: number) {
    const response = await fetch(`${this.baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.sessionToken}`
      },
      body: JSON.stringify({
        stockSiteId,
        itemUrl,
        itemType: 'PHOTO',
        cost
      })
    });
    return response.json();
  }
}
```

### Python

```python
import requests

class StockMediaAPI:
    def __init__(self, base_url, session_token):
        self.base_url = base_url
        self.session_token = session_token
        self.headers = {
            'Authorization': f'Bearer {session_token}',
            'Content-Type': 'application/json'
        }

    def get_stock_sites(self):
        response = requests.get(f'{self.base_url}/api/stock-sites')
        return response.json()

    def create_order(self, stock_site_id, item_url, cost):
        data = {
            'stockSiteId': stock_site_id,
            'itemUrl': item_url,
            'itemType': 'PHOTO',
            'cost': cost
        }
        response = requests.post(
            f'{self.base_url}/api/orders',
            headers=self.headers,
            json=data
        )
        return response.json()
```

## Support

For API support and questions:
- **Email:** support@stockmediapro.com
- **Documentation:** https://docs.stockmediapro.com
- **Status Page:** https://status.stockmediapro.com
