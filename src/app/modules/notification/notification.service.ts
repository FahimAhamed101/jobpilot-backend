// notification.service.ts
import { NotificationModel } from "./notification.model";
import { TNotificationType } from "./notification.interface";
import { User } from "../user/user.model";
import mongoose from 'mongoose';

// Enhanced send notification with preference checking
const sendRealTimeNotification = async (
  userId: string, 
  title: string, 
  text: string, 
  type: TNotificationType = 'info',
  data: any = {}
) => {
  try {
    // Check user's notification preferences
    const user = await User.findById(userId).select('notificationPreferences fcmToken');
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if this notification type is enabled by user
    if (user.notificationPreferences && !user.notificationPreferences[type]) {
      console.log(`Notification type ${type} is disabled for user ${userId}`);
      return null;
    }

    // Create notification in database
    const notification = new NotificationModel({
      title,
      text,
      userId,
      type,
      data,
      read: false,
    });

    await notification.save();

    // Send push notification if user has FCM token
    if (user.fcmToken) {
      await sendPushNotification(userId, text, title, { ...data, type });
    }

    const populatedNotification = await NotificationModel.findById(notification._id)
      .populate('userId', 'name email');

    return populatedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Enhanced push notification function
const sendPushNotification = async (userId: string, text: string, title: string, data: any = {}) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      console.log(`User ${userId} not found`);
      return null;
    }

    if (!user.fcmToken) {
      console.log(`No FCM token for user ${userId}`);
      return null;
    }

    const message = {
      notification: {
        title: title,
        body: text,
      },
      data: {
        ...data,
        type: data.type || 'info',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        userId: userId.toString(),
      },
      token: user.fcmToken,
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Push notification sent successfully:', response);
    
    return response;
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    
    // Handle invalid token errors
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      await User.findByIdAndUpdate(userId, { 
        $unset: { fcmToken: 1 } 
      });
      console.log(`Removed invalid FCM token for user ${userId}`);
    }
    
    return null;
  }
};

// Get notifications with advanced filtering
const getNotificationUnderUser = async (userId: string, filters: any = {}) => {
  const { 
    page = 1, 
    limit = 20, 
    type, 
    read, 
    startDate, 
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  // Build query
  const query: any = { userId };

  // Apply type filter
  if (type && type !== 'all') {
    query.type = type;
  }

  // Apply read status filter
  if (read !== undefined) {
    query.read = read === 'true';
  }

  // Apply date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const result = await NotificationModel.find(query)
    .sort(sort)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate('userId', 'name email');

  const total = await NotificationModel.countDocuments(query);

  // Get counts by type for filters
  const typeCounts = await NotificationModel.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
        }
      }
    }
  ]);

  // Get user preferences
  const user = await User.findById(userId).select('notificationPreferences');

  return {
    notifications: result,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
    filters: {
      typeCounts: typeCounts.reduce((acc: any, curr) => {
        acc[curr._id] = { total: curr.count, unread: curr.unread };
        return acc;
      }, {}),
      totalUnread: await NotificationModel.countDocuments({ userId, read: false }),
      userPreferences: user?.notificationPreferences
    }
  };
};

// Mark as read
const markAsRead = async (notificationId: string, userId: string) => {
  const result = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  ).populate('userId', 'name email');
  
  return result;
};

// Mark all as read
const markAllAsRead = async (userId: string, type?: TNotificationType) => {
  const query: any = { userId, read: false };
  if (type) query.type = type;

  const result = await NotificationModel.updateMany(
    query,
    { read: true }
  );

  return result;
};

// Get unread count
const getUnreadCount = async (userId: string, type?: TNotificationType) => {
  const query: any = { userId, read: false };
  if (type) query.type = type;

  const count = await NotificationModel.countDocuments(query);
  return count;
};

// Delete notification
const deleteNotification = async (notificationId: string, userId: string) => {
  const result = await NotificationModel.findOneAndDelete({
    _id: notificationId,
    userId,
  });
  return result;
};

export const notificationService = {
  getNotificationUnderUser,
  sendRealTimeNotification,
  sendPushNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
};