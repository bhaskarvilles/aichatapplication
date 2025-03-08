import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { verifySubscription } from '@/lib/razorpay';
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

    const { razorpaySignature, subscriptionId } = await request.json();
    
    // Verify the payment signature
    const isValid = await verifySubscription(razorpaySignature, subscriptionId);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Update subscription status
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionId,
      userId: decoded.id,
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    subscription.status = 'active';
    await subscription.save();

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
    });
  } catch (error) {
    console.error('Subscription verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify subscription' },
      { status: 500 }
    );
  }
} 