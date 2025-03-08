import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { createSubscription } from '@/lib/razorpay';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    const { planId } = await request.json();
    
    // Create subscription in Razorpay
    const razorpaySubscription = await createSubscription(planId);

    // Create subscription record in database
    const subscription = new Subscription({
      userId: decoded.id,
      planId,
      razorpaySubscriptionId: razorpaySubscription.id,
      status: 'pending',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    await subscription.save();

    return NextResponse.json({
      subscriptionId: razorpaySubscription.id,
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
} 