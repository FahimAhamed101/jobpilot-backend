import { USER_ROLE } from './../user/user.constant';
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from '../user/user.validation';
import { UserController } from '../user/user.controller';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/register',
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.createUser
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginIntoDB
);

router.post('/forgot-password', AuthController.forgotPassword);
router.post('/resend-otp', AuthController.resendOTP);
router.post(
  '/verify-email',
  validateRequest(AuthValidation.verifyEmailValidationSchema),
  AuthController.verifyEmail
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword
);

//refresh token
router.post('/refresh-token', AuthController.refreshToken);

router.patch(
  '/change-password',
  auth(USER_ROLE.user, USER_ROLE.superAdmin, USER_ROLE.analyst, USER_ROLE.admin),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword
);
export const AuthRoutes = router;
