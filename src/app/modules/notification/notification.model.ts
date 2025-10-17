// notification.model.ts
import mongoose, { Schema, Types } from 'mongoose';
import { TNotification, TNotificationType } from './notification.interface';

const notificationSchema = new Schema<TNotification>({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['applied', 'shortlisted', 'interview', 'offer', 'info', 'system'],
    default: 'info',
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, { 
  timestamps: true 
});

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, read: 1 });
notificationSchema.index({ userId: 1, read: 1 });

export const NotificationModel = mongoose.model<TNotification>('Notification', notificationSchema);