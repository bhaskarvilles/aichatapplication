import mongoose from 'mongoose';

export interface IChat extends mongoose.Document {
  title: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chat title is required'],
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
}, {
  timestamps: true,
});

// Index for faster queries
chatSchema.index({ userId: 1, updatedAt: -1 });

export const ChatModel = mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema);
export default ChatModel; 