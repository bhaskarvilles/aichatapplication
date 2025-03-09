import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { ChatModel } from '@/models/Chat';

export async function GET(request: Request) {
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

    await connectDB();

    const chats = await ChatModel.find({ userId: decoded.id })
      .sort({ updatedAt: -1 })
      .select('_id title createdAt updatedAt')
      .exec();

    return NextResponse.json({
      chats: chats.map(chat => ({
        id: chat._id.toString(),
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
} 