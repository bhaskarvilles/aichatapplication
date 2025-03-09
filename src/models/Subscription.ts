import mongoose from 'mongoose';

export interface ISubscription extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  paymentId?: string;
}

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  plan: {
    type: String,
    enum: ['basic', 'pro', 'enterprise'],
    required: [true, 'Subscription plan is required'],
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: [true, 'Subscription end date is required'],
  },
  paymentId: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for faster queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 });

export const SubscriptionModel = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', subscriptionSchema);
export default SubscriptionModel; 