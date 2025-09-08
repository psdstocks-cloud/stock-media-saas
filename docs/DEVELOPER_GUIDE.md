# StockMedia Pro Developer Guide

## Overview

This guide is for developers who want to integrate with StockMedia Pro's API or contribute to the project. It covers the technical architecture, development setup, and integration patterns.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Database Schema](#database-schema)
4. [API Integration](#api-integration)
5. [Webhook Integration](#webhook-integration)
6. [Contributing](#contributing)
7. [Deployment](#deployment)

## Architecture Overview

### Tech Stack

- **Frontend:** Next.js 14 with TypeScript
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **External API:** Nehtw.com
- **Deployment:** Vercel
- **Styling:** Tailwind CSS + Radix UI

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Stripe        │    │   Nehtw API     │    │   File Storage  │
│   (Payments)    │    │   (Downloads)   │    │   (Vercel)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

1. **Authentication System**
   - NextAuth.js with JWT sessions
   - Password hashing with bcrypt
   - Role-based access control

2. **Point Management System**
   - Transaction-based point tracking
   - Rollover calculations
   - Balance validation

3. **Order Processing**
   - Asynchronous order handling
   - External API integration
   - Status tracking

4. **Subscription Management**
   - Stripe integration
   - Webhook handling
   - Plan management

## Development Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account
- Nehtw.com API access

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/psdstocks-cloud/stock-media-saas.git
cd stock-media-saas
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env.local
```

4. **Configure environment variables**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stockmedia"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# External APIs
NEHTW_API_KEY="your-api-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

5. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database
npm run db:seed
```

6. **Start the development server**
```bash
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with initial data

# Testing
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## Database Schema

### Core Models

#### User
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      String   @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  subscription   Subscription?
  pointsBalance  PointsBalance?
  orders         Order[]
  pointHistory   PointTransaction[]
}
```

#### SubscriptionPlan
```prisma
model SubscriptionPlan {
  id           String  @id @default(cuid())
  name         String  @unique
  description  String?
  price        Float
  points       Int
  rolloverLimit Int
  isActive     Boolean @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relations
  subscriptions Subscription[]
}
```

#### Order
```prisma
model Order {
  id          String   @id @default(cuid())
  userId      String
  stockSiteId String
  itemUrl     String
  itemType    String
  cost        Float
  status      String   @default("PENDING")
  downloadUrl String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  completedAt DateTime?
  
  // Relations
  user      User       @relation(fields: [userId], references: [id])
  stockSite StockSite  @relation(fields: [stockSiteId], references: [id])
}
```

### Database Relationships

```
User (1) ── (1) Subscription
User (1) ── (1) PointsBalance
User (1) ── (*) Order
User (1) ── (*) PointTransaction

SubscriptionPlan (1) ── (*) Subscription
StockSite (1) ── (*) Order
```

## API Integration

### Authentication Flow

1. **User Registration**
```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securepassword',
    planId: 'plan_id'
  })
});
```

2. **User Login**
```typescript
const response = await fetch('/api/auth/[...nextauth]', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securepassword'
  })
});
```

3. **Authenticated Requests**
```typescript
const response = await fetch('/api/orders', {
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Point Management

```typescript
// Add points to user account
const addPoints = async (userId: string, amount: number, type: string, description: string) => {
  const response = await fetch('/api/points', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      amount,
      type,
      description
    })
  });
  return response.json();
};

// Get user's point balance
const getPointsBalance = async (sessionToken: string) => {
  const response = await fetch('/api/points', {
    headers: {
      'Authorization': `Bearer ${sessionToken}`
    }
  });
  return response.json();
};
```

### Order Processing

```typescript
// Create a new order
const createOrder = async (orderData: {
  stockSiteId: string;
  itemUrl: string;
  itemType: string;
  cost: number;
}) => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
  return response.json();
};

// Check order status
const getOrderStatus = async (orderId: string) => {
  const response = await fetch(`/api/orders/${orderId}/status`, {
    headers: {
      'Authorization': `Bearer ${sessionToken}`
    }
  });
  return response.json();
};
```

## Webhook Integration

### Stripe Webhooks

Set up webhook endpoints to handle Stripe events:

```typescript
// /api/stripe/webhook
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      // Handle other events...
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
```

### Nehtw.com Webhooks

Handle download completion notifications:

```typescript
// /api/webhooks/nehtw
export async function POST(request: Request) {
  const data = await request.json();
  
  if (data.status === 'completed') {
    await updateOrderStatus(data.orderId, 'COMPLETED', data.downloadUrl);
  }
  
  return NextResponse.json({ received: true });
}
```

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**
4. **Write tests**
```bash
npm run test
```

5. **Run linting**
```bash
npm run lint
```

6. **Commit your changes**
```bash
git commit -m "feat: add your feature"
```

7. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

8. **Create a pull request**

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Use meaningful commit messages
- Document public APIs

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- src/lib/points.test.ts
```

### Pull Request Guidelines

1. **Clear description** of changes
2. **Link to related issues**
3. **Screenshots** for UI changes
4. **Test coverage** for new features
5. **Documentation updates** if needed

## Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### Environment Variables

Required environment variables for production:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# External APIs
NEHTW_API_KEY="your-api-key"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### Database Migration

```bash
# Generate migration
npx prisma migrate dev --name your-migration-name

# Deploy migration to production
npx prisma migrate deploy
```

### Monitoring

- **Vercel Analytics** - Performance monitoring
- **Sentry** - Error tracking
- **Stripe Dashboard** - Payment monitoring
- **Database monitoring** - Query performance

## Security Considerations

### Authentication
- Use strong session secrets
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production

### Database
- Use parameterized queries
- Implement proper indexing
- Regular backups
- Access control

### API Security
- Validate webhook signatures
- Implement CORS properly
- Rate limiting
- Input sanitization

## Performance Optimization

### Database
- Proper indexing
- Query optimization
- Connection pooling
- Caching strategies

### Frontend
- Code splitting
- Image optimization
- CDN usage
- Caching headers

### API
- Response caching
- Pagination
- Compression
- Async processing

## Support

For developer support:
- **GitHub Issues** - Bug reports and feature requests
- **Discord** - Developer community
- **Email** - dev@stockmediapro.com
- **Documentation** - https://docs.stockmediapro.com

---

**Happy coding! 🚀**
