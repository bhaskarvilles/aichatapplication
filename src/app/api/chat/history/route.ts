import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { MessageModel } from '@/models/Message';
import { verifyToken } from '@/lib/jwt';

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

    const messages = await MessageModel.find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .select('_id content role createdAt chatId')
      .exec();

    return NextResponse.json({
      messages: messages.map(msg => ({
        id: msg._id.toString(),
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt,
        chatId: msg.chatId.toString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching message history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message history' },
      { status: 500 }
    );
  }
} 