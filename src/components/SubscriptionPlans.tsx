'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/razorpay';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function SubscriptionPlans() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-blue-700">Premium Features Coming Soon!</h2>
        </div>
        <p className="text-blue-600">
          We're currently in beta. Premium features will be available soon. Stay tuned!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:gap-8 max-w-5xl mx-auto">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
          <Card key={plan.id} className="flex flex-col relative overflow-hidden">
            {key === 'PRO' && (
              <div className="absolute top-4 right-4">
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <p className="text-3xl font-bold text-blue-600">
                ₹{plan.price}
                <span className="text-base font-normal text-gray-600">/month</span>
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => toast.info('Premium features will be available soon!')}
                disabled={true}
                className="w-full"
                variant={key === 'PRO' ? 'outline' : 'default'}
              >
                {key === 'BASIC' ? 'Currently in Beta' : 'Coming Soon'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>During the beta period, all users have access to basic features.</p>
        <p className="mt-1">Subscribe to our newsletter to get notified when premium features launch!</p>
      </div>
    </div>
  );
} 