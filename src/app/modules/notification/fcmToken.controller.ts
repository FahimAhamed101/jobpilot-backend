// controllers/fcmToken.controller.ts
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { User } from '../user/user.model';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

// Save FCM token
const saveFCMToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.user;
  const { fcmToken } = req.body;

  if (!fcmToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "FCM token is required");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { 
      $set: { fcmToken },
      $addToSet: { fcmTokens: fcmToken }
    },
    { new: true }
  ).select('name email fcmToken notificationPreferences');

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  sendResponse(res, {
    code: StatusCodes.OK,
    message: "FCM token saved successfully",
    data: user,
  });
});

// Update notification preferences
const updateNotificationPreferences = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.user;
  const { preferences } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { 
      $set: { notificationPreferences: preferences }
    },
    { new: true }
  ).select('name email notificationPreferences');

  sendResponse(res, {
    code: StatusCodes.OK,
    message: "Notification preferences updated successfully",
    data: user,
  });
});

// Remove FCM token (logout)
const removeFCMToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.user;
  const { fcmToken } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { 
      $unset: { fcmToken: "" },
      $pull: { fcmTokens: fcmToken }
    },
    { new: true }
  ).select('name email');

  sendResponse(res, {
    code: StatusCodes.OK,
    message: "FCM token removed successfully",
    data: user,
  });
});

export const fcmTokenController = {
  saveFCMToken,
  updateNotificationPreferences,
  removeFCMToken,
};