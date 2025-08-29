# Payment Flow Learning Project

A complete payment flow implementation built with Next.js, demonstrating pricing plans, checkout processing, and subscription management through a hands-on learning approach.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Seed with demo plans
npm run seed

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the app!

## 📁 Project Structure

```
/src/app/*               # Next.js App Router pages & API routes
/src/components/*        # Reusable UI components
/src/lib/
  ├── db.ts             # Prisma database client
  ├── analytics.ts      # Event tracking utilities
/prisma/
  ├── schema.prisma     # Database schema
/scripts/
  ├── seed.ts           # Database seeding script
```

## 🏗️ Architecture Overview

This project demonstrates a complete payment flow with three core components:

1. **Pricing Plans** - Display available subscription tiers
2. **Checkout Flow** - Process payments and create subscriptions  
3. **Subscription Management** - View and update subscription status

## 📊 Database Schema

### Concept Notes: Database Design

**Plans Table**: Represents the subscription tiers customers can purchase. Each plan has:
- `price` (in cents to avoid floating-point errors)
- `interval` (monthly/yearly billing cycles)  
- `features` (JSON array of what's included)
- `isActive` flag (for hiding deprecated plans without breaking existing subscriptions)

**Subscriptions Table**: Tracks customer subscriptions with:
- `status` enum (ACTIVE, TRIALING, CANCELED, etc.)
- `currentPeriodStart/End` (for billing cycles)
- `planId` reference (so plan changes don't affect existing customers)

**Events Table**: Analytics tracking for:
- User behavior (`pricing_viewed`, `checkout_started`)
- Business metrics (`checkout_completed`, `subscription_canceled`)
- Debugging and funnel analysis

## 🧪 Phase 1: Pricing Page & Event Tracking ✅

### What's Working
- ✅ Plans loaded from SQLite database
- ✅ Clean pricing UI with feature lists
- ✅ Event tracking (`pricing_viewed` fires on page load)
- ✅ Popular plan highlighting
- ✅ Responsive design

### Walkthrough: Testing Phase 1

1. **Start the app**: `npm run dev`
2. **Visit homepage**: http://localhost:3000
   - See phase progress overview
   - Click "View Pricing Plans"
3. **Pricing page**: http://localhost:3000/pricing
   - Should load 3 plans: Basic ($9.99), Pro ($29.99), Enterprise ($99.99)
   - Pro plan highlighted as "Most Popular"
   - Click any "Get Started" button → alert shows (Phase 2 coming next)
4. **Check event tracking**: Look at your terminal console
   - Should see: `📊 Event tracked: pricing_viewed`

### Verify Phase 1 is Working
- [ ] Plans display correctly with prices and features
- [ ] "Most Popular" badge appears on Pro plan
- [ ] Console shows `pricing_viewed` event when visiting /pricing
- [ ] Clicking plan buttons shows alert with plan ID

### Common Pitfalls
- **Database not seeded**: Run `npm run seed` if you see empty pricing page
- **Port conflicts**: Change port with `npm run dev -- -p 3001` 
- **Events not tracking**: Check browser dev tools network tab for failed /api/analytics calls

### Production-Readiness Notes

**What's Mocked in Phase 1**:
- ✅ Real database (SQLite for local dev)
- ✅ Real event tracking system
- ❌ User authentication (using placeholder user IDs)
- ❌ Payment processing (buttons show alerts)

**Real Production Requirements**:
- **Authentication**: Next-Auth.js or Auth0 for user sessions
- **Database**: PostgreSQL on Vercel/Railway for production
- **Analytics**: Ship events to PostHog, Mixpanel, or custom analytics pipeline
- **Monitoring**: Error tracking with Sentry, performance with Vercel Analytics

## 💳 Phase 2: Checkout Flow ✅

### What's Working
- ✅ Complete checkout page with payment form
- ✅ Mock payment processor with realistic delays and test cards
- ✅ Subscription creation in database  
- ✅ Success/failure handling with proper error messages
- ✅ Event tracking (`checkout_started`, `checkout_completed`, `checkout_failed`)
- ✅ Professional payment form with validation

### Walkthrough: Testing Phase 2

1. **Start checkout flow**: Visit pricing → Click any "Get Started" button
2. **Checkout page**: http://localhost:3000/checkout?planId=[plan-id]
   - Shows order summary with plan details
   - Displays professional payment form with Stripe integration notes
3. **Test payment scenarios**:
   - **Success**: Use card `4242424242424242` with any future expiry/CVC
   - **Decline**: Use card `4000000000000002`
   - **Insufficient funds**: Use card `4000000000000119`
4. **Success flow**: Completes → redirects to success page with subscription details
5. **Check event tracking**: Terminal shows payment processing logs

### Verify Phase 2 is Working
- [ ] Checkout page loads with selected plan details
- [ ] Payment form validates required fields
- [ ] Test cards trigger appropriate success/failure responses
- [ ] Successful payments create subscriptions in database
- [ ] Success page displays subscription information
- [ ] Console shows checkout events (`checkout_started`, `checkout_completed`)

### Common Pitfalls
- **Missing planId**: Checkout redirects to pricing if no plan selected
- **Form validation**: All fields required, card format validated
- **Network delays**: Mock processor simulates 1.5-2.5 second delays

### Production-Readiness Notes

**What's Working in Phase 2**:
- ✅ Complete checkout user experience
- ✅ Payment form validation and UX
- ✅ Database subscription creation
- ✅ Event tracking and logging
- ❌ Mock payment processor (not real payments)
- ❌ No webhook handling for payment updates

**Real Stripe Integration Requirements**:

**1. Frontend (Stripe Elements)**:
```typescript
// Replace PaymentForm with Stripe Elements
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
```

**2. Backend Payment Intent Creation**:
```typescript
// Replace processPayment() with:
const paymentIntent = await stripe.paymentIntents.create({
  amount: plan.price,
  currency: 'usd',
  customer: customer.id,
  metadata: { planId, subscriptionId }
})
```

**3. Webhook Handling**:
- Set up `/api/webhooks/stripe` endpoint
- Handle `payment_intent.succeeded` events
- Update subscription status based on payment results
- Verify webhook signatures for security

**4. Security & Compliance**:
- Card details never touch your server (Stripe Elements handles this)
- PCI compliance handled by Stripe
- Webhook signature verification prevents fraud

## 🎯 Phase 3: Subscription Management ✅

### What's Working
- ✅ Complete subscription dashboard with current plan overview
- ✅ Real-time plan upgrade/downgrade functionality
- ✅ Subscription cancellation with period-end access
- ✅ Comprehensive billing history with transaction details
- ✅ Event tracking (`subscription_management_viewed`, `subscription_plan_changed`, `subscription_canceled`)
- ✅ Professional management interface with status indicators

### Walkthrough: Testing Phase 3

1. **Complete a subscription first**: Go through pricing → checkout → success flow
2. **Access management**: Visit http://localhost:3000/manage or click "Manage Subscription" on success page
3. **View subscription overview**:
   - Current plan details with features and pricing
   - Billing cycle information and next renewal date
   - Subscription status (ACTIVE, CANCELED, etc.)
4. **Test plan changes**:
   - Upgrade or downgrade between available plans
   - See real-time price differences and feature updates
   - Watch for confirmation and loading states
5. **Test cancellation**:
   - Cancel subscription with confirmation dialog
   - Observe "access until period end" messaging
   - See status change to CANCELED with reactivation option
6. **Review billing history**:
   - View chronological transaction history
   - See payment events, plan changes, and cancellations
   - Test export functionality (shows production alerts)

### Verify Phase 3 is Working
- [ ] Management page loads with current subscription details
- [ ] Plan upgrade/downgrade changes subscription in database
- [ ] Cancellation updates status and shows appropriate messaging
- [ ] Billing history displays realistic transaction data
- [ ] All actions show proper loading states and error handling
- [ ] Console shows management events (`subscription_management_viewed`, etc.)

### Common Pitfalls
- **No subscription found**: Complete checkout flow first to create subscription
- **Plan changes fail**: Ensure subscription is ACTIVE status for changes
- **Cancellation restrictions**: Only active subscriptions can be canceled

### Production-Readiness Notes

**What's Working in Phase 3**:
- ✅ Complete subscription management user experience
- ✅ Plan change logic with database updates
- ✅ Cancellation handling with proper messaging
- ✅ Billing history simulation with realistic data
- ✅ Event tracking for all management actions
- ❌ Mock subscription operations (not real billing)
- ❌ No webhook handling for external payment updates

**Real Stripe Subscription Management Requirements**:

**1. Subscription Updates**:
```typescript
// Plan changes via Stripe API
const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
  items: [{
    id: subscriptionItem.id,
    price: newPriceId,
  }],
  proration_behavior: 'create_prorations', // Handle billing adjustments
})
```

**2. Cancellation Handling**:
```typescript
// Cancel at period end (recommended approach)
const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
  cancel_at_period_end: true
})

// Immediate cancellation (less common)
const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId)
```

**3. Billing History Integration**:
```typescript
// Fetch invoices from Stripe
const invoices = await stripe.invoices.list({
  customer: customerId,
  limit: 10
})

// Get payment history
const payments = await stripe.paymentIntents.list({
  customer: customerId
})
```

**4. Webhook Integration**:
- Handle `invoice.payment_succeeded` for successful billing
- Handle `customer.subscription.updated` for plan changes
- Handle `customer.subscription.deleted` for cancellations
- Update local database based on Stripe events

**5. Proration and Billing Logic**:
- Stripe automatically handles prorations for mid-cycle plan changes
- Credit/charge differences are applied to next invoice
- Cancellations preserve access until period end by default

## 🛠️ Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run db:push      # Push schema changes to database
npm run seed         # Seed database with demo data
npm run lint         # Run ESLint
```

## 🎯 Learning Objectives Achieved

### Technical Skills
- [x] Next.js 15 App Router structure
- [x] Prisma ORM with SQLite
- [x] TypeScript interfaces for type safety
- [x] API route design (`/api/plans`, `/api/analytics`)  
- [x] Client-side data fetching patterns
- [x] Event-driven architecture basics

### Business Concepts  
- [x] SaaS pricing tier strategy
- [x] Subscription lifecycle states
- [x] Analytics event design
- [x] Feature flag patterns (plan `isActive`)

### UI/UX Patterns
- [x] Responsive pricing table design
- [x] Loading states and error handling
- [x] Progressive disclosure (phase-by-phase features)

---

## 🎉 All Phases Complete!

The complete payment flow learning project is now finished with all three phases implemented:

### ✅ What We Built
- **Phase 1**: Pricing plans with database integration and event tracking
- **Phase 2**: Complete checkout flow with mock payment processing
- **Phase 3**: Full subscription management dashboard with plan changes and billing history

### 🎯 Key Learning Outcomes Achieved

**Technical Implementation**:
- Next.js 15 App Router with TypeScript for type safety
- Prisma ORM with SQLite for local development
- Mock payment processing that simulates real-world scenarios
- Comprehensive event tracking system for analytics
- Professional UI/UX patterns for SaaS applications

**Business Understanding**:
- SaaS pricing tier strategy and plan management
- Subscription lifecycle management (active → canceled → reactivation)
- Payment flow UX best practices
- Billing history and transaction tracking
- Customer subscription management workflows

**Production Readiness**:
- Clear separation between mock and production code
- Detailed Stripe integration documentation
- Webhook handling patterns for payment events
- Security considerations and PCI compliance notes
- Scalable database schema design

### 🚀 Next Steps for Real Implementation

To take this to production:
1. **Replace mock payment processor** with Stripe Elements and Payment Intents
2. **Add user authentication** with NextAuth.js or similar
3. **Implement webhook handling** for payment event processing
4. **Switch to PostgreSQL** for production database
5. **Add email notifications** for subscription changes
6. **Implement proper error handling** and monitoring
7. **Add comprehensive testing** suite

### 💡 Project Highlights

This project demonstrates a complete SaaS payment flow from first principles, with:
- Realistic payment scenarios including failures and edge cases
- Production-ready UI/UX patterns
- Comprehensive event tracking for business intelligence
- Clear architectural decisions with detailed explanations
- Step-by-step phase implementation for learning

**Perfect for**: Learning SaaS fundamentals, understanding payment flows, building subscription businesses, or as a foundation for production SaaS applications.