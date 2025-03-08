// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic Plan',
    price: 499, // INR
    features: [
      '100 messages per day',
      'Basic AI responses',
      'Email support',
    ],
    period: 'monthly',
  },
  PRO: {
    id: 'pro',
    name: 'Pro Plan',
    price: 999, // INR
    features: [
      'Unlimited messages',
      'Advanced AI responses',
      'Priority support',
      'Custom AI training',
    ],
    period: 'monthly',
  },
};

// Placeholder functions for future implementation
export const createSubscription = async (planId: string) => {
  console.log('Subscription creation is disabled in beta');
  throw new Error('Subscription feature is not available in beta');
};

export const verifySubscription = async (razorpaySignature: string, subscriptionId: string) => {
  console.log('Subscription verification is disabled in beta');
  return false;
}; 