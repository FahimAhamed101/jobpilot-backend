// notification.routes.ts
import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { notificationController } from './notification.controller';

const router = express.Router();

// Get notifications with filtering
router.get(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst),
  notificationController.getNotificationUnderUser
);

// Get unread count
router.get(
  '/unread-count',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst),
  notificationController.getUnreadNotificationCount
);

// Mark as read
router.patch(
  '/:notificationId/read',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst),
  notificationController.markNotificationAsRead
);

// Mark all as read
router.patch(
  '/mark-all-read',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst),
  notificationController.markAllNotificationsAsRead
);

// Send test notification
router.post(
  '/test',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst),
  notificationController.sendTestNotification
);

export const notificationRouter = router;