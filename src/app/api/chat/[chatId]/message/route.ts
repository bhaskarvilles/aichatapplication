import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { Chat } from '@/models/Chat';
import { Message } from '@/models/Message';
import { generateChatResponse } from '@/lib/openai';

export async function POST(
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

    // Verify chat exists and belongs to user
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

    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Save user message
    const userMessage = await Message.create({
      chatId: params.chatId,
      userId: payload.id,
      content: message,
      role: 'user',
    });

    try {
      // Generate AI response using OpenAI
      const aiResponse = await generateChatResponse(message);

      // Save AI response
      const assistantMessage = await Message.create({
        chatId: params.chatId,
        userId: payload.id,
        content: aiResponse,
        role: 'assistant',
      });

      // Update chat's last message
      await Chat.findByIdAndUpdate(params.chatId, {
        lastMessage: message,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        messages: [
          {
            id: userMessage._id.toString(),
            content: userMessage.content,
            role: userMessage.role,
            createdAt: userMessage.createdAt,
            isEdited: userMessage.isEdited,
            reactions: userMessage.reactions,
          },
          {
            id: assistantMessage._id.toString(),
            content: assistantMessage.content,
            role: assistantMessage.role,
            createdAt: assistantMessage.createdAt,
            isEdited: assistantMessage.isEdited,
            reactions: assistantMessage.reactions,
          },
        ],
      });
    } catch (error) {
      // If AI response fails, still return the user message but with an error
      console.error('AI response generation error:', error);
      return NextResponse.json({
        messages: [{
          id: userMessage._id.toString(),
          content: userMessage.content,
          role: userMessage.role,
          createdAt: userMessage.createdAt,
          isEdited: userMessage.isEdited,
          reactions: userMessage.reactions,
        }],
        error: 'Failed to generate AI response',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/chat/[chatId]/message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
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

    // Verify chat exists and belongs to user
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

    // Get all messages for this chat
    const messages = await Message.find({ chatId: params.chatId })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      messages: messages.map(msg => ({
        id: msg._id.toString(),
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt,
        isEdited: msg.isEdited,
        reactions: msg.reactions,
      })),
    });
  } catch (error) {
    console.error('Error in GET /api/chat/[chatId]/message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 