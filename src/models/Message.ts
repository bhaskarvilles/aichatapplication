import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  content: string;
  role: 'user' | 'assistant';
  isEdited: boolean;
  reactions: {
    emoji: string;
    userId: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
}

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  reactions: [{
    emoji: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
}, {
  timestamps: true,
});

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

export default Message; 