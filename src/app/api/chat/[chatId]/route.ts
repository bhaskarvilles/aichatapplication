import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { ChatModel } from '@/models/Chat';
import { MessageModel } from '@/models/Message';

export async function PATCH(
  request: Request,
  { params }: { params: { chatId: string } }
) {
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

    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const chat = await ChatModel.findOneAndUpdate(
      {
        _id: params.chatId,
        userId: decoded.id,
      },
      { title },
      { new: true }
    );

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { chatId: string } }
) {
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

    // Delete chat
    const chat = await ChatModel.findOneAndDelete({
      _id: params.chatId,
      userId: decoded.id,
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Delete all messages in the chat
    await MessageModel.deleteMany({
      chatId: params.chatId,
      userId: decoded.id,
    });

    return NextResponse.json({
      message: 'Chat and messages deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
} 