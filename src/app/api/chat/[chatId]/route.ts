import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { Chat } from '@/models/Chat';
import { Message } from '@/models/Message';

export async function PATCH(
  request: Request,
  { params }: { params: { chatId: string } }
) {
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

    const chat = await Chat.findOne({
      _id: params.chatId,
      userId: payload.id,
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    const updates = await request.json();
    const allowedUpdates = ['title', 'isPinned', 'isArchived'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as Record<string, any>);

    const updatedChat = await Chat.findByIdAndUpdate(
      params.chatId,
      filteredUpdates,
      { new: true }
    );

    return NextResponse.json({ chat: updatedChat });
  } catch (error) {
    console.error('Error in PATCH /api/chat/[chatId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { chatId: string } }
) {
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

    const chat = await Chat.findOne({
      _id: params.chatId,
      userId: payload.id,
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chatId: params.chatId });

    // Delete the chat
    await Chat.findByIdAndDelete(params.chatId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/chat/[chatId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 