import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { SubscriptionModel } from '@/models/Subscription';

export async function POST(request: Request) {
  try {
    const headersList = new Headers(request.headers);
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

    const { plan, paymentId } = await request.json();

    if (!plan) {
      return NextResponse.json(
        { error: 'Subscription plan is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Calculate end date (30 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const subscription = await SubscriptionModel.create({
      userId: decoded.id,
      plan,
      paymentId,
      endDate,
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
} 