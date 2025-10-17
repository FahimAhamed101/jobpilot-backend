import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { jwtHelper } from '../../../helpers/jwtHelper';
import config from '../../../config';
import bcrypt from 'bcrypt';
import {
  IChangePassword,
  ILogin,
  IResetPassword,
  IVerifyEmail,
} from '../../../types/auth';
import { sendResetPasswordEmail } from '../../../helpers/emailHelper';
import { Secret } from 'jsonwebtoken';
import createOtp from './createOtp';
import { Types } from 'mongoose';

// Helper function for user status validation
const validateUserStatus = (user: any) => {
  if (user.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Your account has been deleted.'
    );
  }
  if (user.isBlocked) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Your account is blocked.');
  }
};

const loginIntoDB = async (payload: ILogin) => {
  console.log(payload)
  const user = await User.findOne({
    email: payload.email,
  }).select('+password');
  
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found.');
  }

  // For social auth users, they can't use password login
  if (user.authType !== 'local') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Please use ${user.authType} login for this account.`
    );
  }

  validateUserStatus(user);
  
  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'The password you entered is incorrect. Please check and try again.'
    );
  }

  const { password, ...userWithoutPassword } = user.toObject();

  const accessTokenPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtHelper.createToken(
    accessTokenPayload,
    config.jwt.accessSecret as Secret,
    config.jwt.accessExpirationTime
  );
  const refreshToken = jwtHelper.createToken(
    accessTokenPayload,
    config.jwt.accessSecret as Secret,
    config.jwt.refreshExpirationTime
  );
  
  return {
    user: userWithoutPassword,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

// Social login service
const socialLogin = async (user: any) => {
  validateUserStatus(user);

  const accessTokenPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtHelper.createToken(
    accessTokenPayload,
    config.jwt.accessSecret as Secret,
    config.jwt.accessExpirationTime
  );
  const refreshToken = jwtHelper.createToken(
    accessTokenPayload,
    config.jwt.accessSecret as Secret,
    config.jwt.refreshExpirationTime
  );

  const { password, ...userWithoutPassword } = user.toObject();

  return {
    user: userWithoutPassword,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email, isEmailVerified: true });
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found.');
  }
  
  // Social auth users can't reset password this way
  if (user.authType !== 'local') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Password reset not available for ${user.authType} accounts.`
    );
  }

  validateUserStatus(user);

  const { oneTimeCode, oneTimeCodeExpire } = createOtp();
  user.otpCountDown = 180;
  user.isResetPassword = true;
  user.oneTimeCode = oneTimeCode;
  user.oneTimeCodeExpire = oneTimeCodeExpire;

  await user.save();
  await sendResetPasswordEmail(user.email, oneTimeCode);

  return user;
};

const resendOTP = async (email: string) => {
  const user = await User.findOne({ email});

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found.');
  }

  // Reset OTP countdown and generate a new OTP
  user.otpCountDown = 180; // Reset countdown to 180 seconds
  const { oneTimeCode, oneTimeCodeExpire } = createOtp(); // Generate new OTP
  user.oneTimeCode = oneTimeCode;
  user.oneTimeCodeExpire = oneTimeCodeExpire;

  await user.save();

  // Send the OTP via email
  await sendResetPasswordEmail(user.email, oneTimeCode);

  return user;
};

const verifyEmail = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'No account found with this email address. Please check and try again.'
    );
  }

  if (user.oneTimeCode !== String(oneTimeCode) || !user.oneTimeCodeExpire) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'The OTP provided is invalid. Please check and try again.'
    );
  }
  if (new Date() > new Date(user.oneTimeCodeExpire)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'The OTP has expired. Please request a new one.'
    );
  }
  if (user.isEmailVerified && !user.isResetPassword) {
    user.isEmailVerified = true;
    user.oneTimeCode = null;
    user.oneTimeCodeExpire = null;
    user.otpCountDown = null;
    return await user.save();
  }
  if (user.isEmailVerified && user.isResetPassword) {
    user.isEmailVerified = true;
    user.isResetPassword = false;
    user.oneTimeCode = null;
    user.oneTimeCodeExpire = null;
    user.otpCountDown = null;
    return await user.save();
  }
  user.isEmailVerified = true;
  user.isResetPassword = false;
  user.oneTimeCode = null;
  user.oneTimeCodeExpire = null;
  user.otpCountDown = null;
  await user.save();
  const accessTokenPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtHelper.createToken(
    accessTokenPayload,
    config.jwt.accessSecret as Secret,
    config.jwt.accessExpirationTime
  );
  const refreshToken = jwtHelper.createToken(
    accessTokenPayload,
    config.jwt.accessSecret as Secret,
    config.jwt.refreshExpirationTime
  );
  return {
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

const resetPassword = async (payload: IResetPassword) => {
  const {email, ConfirmPassword, newPassword } = payload;
  console.log("==============>>>>>>>>>>" ,email, ConfirmPassword, newPassword)
  if (newPassword !== ConfirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Passwords do not match.');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found.');
  }
  
  // Social auth users can't reset password this way
  if (user.authType !== 'local') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Password reset not available for ${user.authType} accounts.`
    );
  }

  validateUserStatus(user);

  user.password = newPassword;
  user.ConfirmPassword = ConfirmPassword
  await user.save();

  return user;
};

const changePassword = async (userId: Types.ObjectId, payload: IChangePassword) => {
  console.log("userId From service" ,userId)
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found.');
  }
  
  // Social auth users can't change password
  if (user.authType !== 'local') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Password change not available for ${user.authType} accounts.`
    );
  }

  console.log("============>>>>" , user)
  validateUserStatus(user);
  if (payload.currentPassword === payload.newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Your new password cannot be the same as the current password. Please choose a different password.'
    );
  }
  const isCurrentPasswordValid = await bcrypt.compare(
    payload.currentPassword,
    user.password
  );
  if (!isCurrentPasswordValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Your current password is incorrect.'
    );
  }
  user.password = payload.newPassword;
  user.ConfirmPassword = payload.currentPassword 
  await user.save();

  return user;
};

const refreshToken = async (refreshToken: string) => {
  console.log(refreshToken);
  const decoded = jwtHelper.verifyToken(
    refreshToken,
    config.jwt.accessSecret as Secret
  );

  const user = await User.findById(decoded.id).select('+password');

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found.');
  }

  const accessTokenPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtHelper.createToken(
    accessTokenPayload,
    config.jwt.accessSecret as Secret,
    config.jwt.accessExpirationTime
  );

  return {
    accessToken,
  };
};

export const AuthService = {
  loginIntoDB,
  verifyEmail,
  forgotPassword,
  resendOTP,
  resetPassword,
  changePassword,
  refreshToken,
  socialLogin
};