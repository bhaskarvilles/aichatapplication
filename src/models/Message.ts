import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
  chatId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required'],
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: [true, 'Message role is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: [true, 'Chat ID is required'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
});

// Index for faster queries
messageSchema.index({ chatId: 1, createdAt: 1 });
messageSchema.index({ userId: 1 });

export const MessageModel = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);
export default MessageModel; 