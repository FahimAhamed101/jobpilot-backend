// notification.controller.ts
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { notificationService } from './notification.service';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

// Get notifications with filtering
const getNotificationUnderUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.user;
  const filters = req.query;
  
  const result = await notificationService.getNotificationUnderUser(id, filters);
  
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "No Notification Found!");
  }

  sendResponse(res, {
    code: StatusCodes.OK,
    message: "Notifications retrieved successfully",
    data: result
  });
});

// Mark as read
const markNotificationAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.user;
  const { notificationId } = req.params;

  const result = await notificationService.markAsRead(notificationId, id);
  
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found");
  }

  sendResponse(res, {
    code: StatusCodes.OK,
    message: "Notification marked as read",
    data: result
  });
});

// Mark all as read
const markAllNotificationsAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.user;
  const { type } = req.body;

  const result = await notificationService.markAllAsRead(id, type);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: type ? `All ${type} notifications marked as read` : "All notifications marked as read",
    data: result
  });
});

// Get unread count
const getUnreadNotificationCount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.user;
  const { type } = req.query;

  const count = await notificationService.getUnreadCount(id, type as string);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: "Unread count retrieved successfully",
    data: { unreadCount: count }
  });
});

// Send test notification
const sendTestNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.user;
  const { title, text, type } = req.body;

  const notification = await notificationService.sendRealTimeNotification(
    id, 
    title || 'Test Notification', 
    text || 'This is a test notification from your app!', 
    type || 'info'
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: "Test notification sent successfully",
    data: notification
  });
});

export const notificationController = {
  getNotificationUnderUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  sendTestNotification,
};