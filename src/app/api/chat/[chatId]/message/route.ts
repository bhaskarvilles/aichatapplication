import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { MessageModel, IMessage } from '@/models/Message';
import { verifyToken } from '@/lib/jwt';

export async function GET(
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

    const messages = await MessageModel.find({
      chatId: params.chatId,
      userId: decoded.id,
    }).sort({ createdAt: 1 });

    return NextResponse.json({
      messages: messages.map((msg) => ({
        id: msg._id.toString(),
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create user message
    const userMessage = await MessageModel.create({
      content,
      role: 'user',
      chatId: params.chatId,
      userId: decoded.id,
    });

    // TODO: Generate AI response
    const aiResponse = "I am an AI assistant. I will help you with your questions.";

    // Create AI message
    const aiMessage = await MessageModel.create({
      content: aiResponse,
      role: 'assistant',
      chatId: params.chatId,
      userId: decoded.id,
    });

    return NextResponse.json({
      messages: [
        {
          id: userMessage._id.toString(),
          content: userMessage.content,
          role: userMessage.role,
          createdAt: userMessage.createdAt,
        },
        {
          id: aiMessage._id.toString(),
          content: aiMessage.content,
          role: aiMessage.role,
          createdAt: aiMessage.createdAt,
        },
      ],
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
} 