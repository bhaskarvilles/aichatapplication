import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
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
    const userMessage = new Message({
      content: message,
      role: 'user',
      userId: decoded.id,
    });
    await userMessage.save();

    try {
      // Generate AI response using OpenAI
      const aiResponse = await generateChatResponse(message);

      // Save AI response
      const assistantMessage = new Message({
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