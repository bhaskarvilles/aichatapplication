import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { Chat } from '@/models/Chat';

export async function POST() {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload?.id) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    const chat = await Chat.create({
      userId: payload.id,
      title: 'New Chat',
      lastMessage: '',
    });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Error in POST /api/chat/create:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 