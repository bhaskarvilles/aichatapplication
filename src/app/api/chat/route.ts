import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import connectDB from '@/lib/db';
import { MessageModel } from '@/models/Message';
import { generateChatResponse } from '@/lib/openai';

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

    const { message } = await request.json();

    // Create user message
    const userMessage = new MessageModel({
      content: message,
      role: 'user',
      userId: decoded.id,
    });
    await userMessage.save();

    try {
      // Generate AI response using OpenAI
      const aiResponse = await generateChatResponse(message);

      // Save AI response
      const assistantMessage = new MessageModel({
        content: aiResponse,
        role: 'assistant',
        userId: decoded.id,
      });
      await assistantMessage.save();

      return NextResponse.json({
        messages: [userMessage, assistantMessage],
      });
    } catch (error) {
      console.error('AI response error:', error);
      return NextResponse.json(
        { error: 'Failed to generate AI response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
      .select('_id content role createdAt')
      .exec();

    return NextResponse.json({
      messages: messages.map(msg => ({
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