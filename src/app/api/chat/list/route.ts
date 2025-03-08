import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { Chat } from '@/models/Chat';

export async function GET() {
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

    const chats = await Chat.find({ userId: payload.id })
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error in GET /api/chat/list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 