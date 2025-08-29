// Mock Payment Processor
// In production, this would be replaced with Stripe SDK calls

export interface PaymentMethod {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvc: string
  cardholderName: string
}

export interface PaymentResult {
  success: boolean
  paymentIntentId?: string
  error?: string
  customerId?: string
}

export interface MockCustomer {
  id: string
  email: string
  name: string
}

// Mock payment processing with realistic delays and scenarios
export async function processPayment(
  paymentMethod: PaymentMethod,
  amountInCents: number,
  currency: string = 'usd'
): Promise<PaymentResult> {
  
  // Simulate network delay (real Stripe calls take 1-3 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
  
  // Mock validation - simulate card failures
  const cardNumber = paymentMethod.cardNumber.replace(/\s/g, '')
  
  // Special test card numbers (like Stripe's test cards)
  if (cardNumber === '4000000000000002') {
    return {
      success: false,
      error: 'Your card was declined.'
    }
  }
  
  if (cardNumber === '4000000000000119') {
    return {
      success: false,
      error: 'Your card has insufficient funds.'
    }
  }
  
  if (cardNumber === '4000000000000127') {
    return {
      success: false,
      error: 'Your card\'s security code is incorrect.'
    }
  }
  
  // Simulate random failures (5% chance)
  if (Math.random() < 0.05) {
    return {
      success: false,
      error: 'Payment processing failed. Please try again.'
    }
  }
  
  // Success case - generate mock IDs
  const paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const customerId = `cus_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  console.log('💳 Mock payment processed successfully:', {
    paymentIntentId,
    amount: amountInCents,
    currency
  })
  
  return {
    success: true,
    paymentIntentId,
    customerId
  }
}

// Mock customer creation (in production, this would be Stripe's customer API)
export async function createCustomer(email: string, name: string): Promise<MockCustomer> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const customerId = `cus_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  console.log('👤 Mock customer created:', { customerId, email, name })
  
  return {
    id: customerId,
    email,
    name
  }
}

// Validation helpers
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '')
  return /^\d{13,19}$/.test(cleaned)
}

export function validateExpiryDate(month: string, year: string): boolean {
  const monthNum = parseInt(month)
  const yearNum = parseInt(year)
  const currentYear = new Date().getFullYear() % 100
  const currentMonth = new Date().getMonth() + 1
  
  if (monthNum < 1 || monthNum > 12) return false
  if (yearNum < currentYear) return false
  if (yearNum === currentYear && monthNum < currentMonth) return false
  
  return true
}

export function validateCVC(cvc: string): boolean {
  return /^\d{3,4}$/.test(cvc)
}

/*
PRODUCTION STRIPE INTEGRATION NOTES:
=====================================

In a real application, you would replace the mock functions above with Stripe SDK calls:

1. Install Stripe: npm install stripe @stripe/stripe-js

2. Replace processPayment() with:
   ```typescript
   import Stripe from 'stripe'
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
   
   const paymentIntent = await stripe.paymentIntents.create({
     amount: amountInCents,
     currency: 'usd',
     payment_method: paymentMethodId,
     confirm: true,
     return_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success`
   })
   ```

3. Replace createCustomer() with:
   ```typescript
   const customer = await stripe.customers.create({
     email,
     name
   })
   ```

4. Add webhook handling for payment updates:
   - Set up webhook endpoint at /api/webhooks/stripe
   - Handle events: payment_intent.succeeded, payment_intent.payment_failed
   - Update subscription status based on webhook events

5. Security considerations:
   - Never pass card details through your server
   - Use Stripe Elements for secure card input
   - Validate webhook signatures
   - Store only Stripe customer/payment IDs, never raw card data
*/