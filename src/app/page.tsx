import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-6">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Payment Flow Learning
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A complete payment flow implementation with pricing, checkout, and subscription management.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/pricing"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            View Pricing Plans
          </Link>
          
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Phase 1: Pricing & Events ✅</h2>
            <p className="text-gray-600 text-sm">
              This phase demonstrates plan display with database integration and event tracking.
              Click "View Pricing Plans" to see it in action!
            </p>
          </div>
          
          <div className="mt-4 p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Phase 2: Checkout Flow ✅</h2>
            <p className="text-gray-600 text-sm">
              Mock payment processing, subscription creation, and success handling. 
              Click a plan's "Get Started" button to try the full checkout flow!
            </p>
          </div>
          
          <div className="mt-4 p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Phase 3: Subscription Management ✅</h2>
            <p className="text-gray-600 text-sm">
              Complete subscription dashboard with plan changes, cancellation, and billing history. 
              Try it by completing a checkout flow first!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}