// routes/fcmToken.routes.ts
import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { fcmTokenController } from './fcmToken.controller';

const router = express.Router();

router.post(
  '/save-token',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst),
  fcmTokenController.saveFCMToken
);

router.patch(
  '/notification-preferences',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst),
  fcmTokenController.updateNotificationPreferences
);

router.delete(
  '/remove-token',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst),
  fcmTokenController.removeFCMToken
);

export const fcmTokenRouter = router;