import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

//login
const loginIntoDB = catchAsync(async (req, res, next) => {
  console.log("Login Route1" , req.body)
  const result = await AuthService.loginIntoDB(req.body);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Login Successful',
    data: result,
  });
});

// Social login success handler
const socialLoginSuccess = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'Social authentication failed',
      data: null,
    });
  }

  const result = await AuthService.socialLogin(req.user);
  
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Social login successful',
    data: result,
  });
});

// Social login failure handler
const socialLoginFailure = catchAsync(async (req: Request, res: Response) => {
  sendResponse(res, {
    code: StatusCodes.UNAUTHORIZED,
    message: 'Social authentication failed',
    data: null,
  });
});

//forgot password
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);
  sendResponse(res, {
    code: StatusCodes.OK,
    message:
      'OTP sent to your email, please verify your email within the next 3 minutes',
    data: result,
  });
});

//resend otp
const resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const result = await AuthService.resendOTP(email);
  sendResponse(res, {
    code: StatusCodes.OK,
    message:
      'OTP sent to your email, please verify your email within the next 3 minutes',
    data: result,
  });
})

//verify email
const verifyEmail = catchAsync(async (req, res, next) => {
  const verifyData = req.body;
  const result = await AuthService.verifyEmail(verifyData);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Verify Email Successful',
    data: result,
  });
});

//reset password
const resetPassword = catchAsync(async (req, res, next) => {
  const resetPasswordData = req.body;
  
  await AuthService.resetPassword(resetPasswordData);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Reset Password Successful',
    data: {},
  });
});

//change password
const changePassword = catchAsync(async (req, res, next) => {
  const id   = req?.user?.id;
  console.log("========>>>> controller user from token" ,id)
  const changePasswordData = req.body;
  const result = await AuthService.changePassword(id, changePasswordData);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Change Password Successful',
    data: result,
  });
});

//refresh token
const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  const result = await AuthService.refreshToken(refreshToken);
  res.cookie('refreshToken', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Login Successful',
    data: result,
  });
});

export const AuthController = {
  loginIntoDB,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  resendOTP,
  socialLoginSuccess,
  socialLoginFailure,
};