import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export type Role = "admin" | "superAdmin" | "analyst" | "user" | "recruiter";

export type TUser = {
  _id: Types.ObjectId;
  userId: string;
  subscriptionId?: Types.ObjectId;
  
  firstName: string;
  lastName?: string;
  fullName?: string;
  email: string;
  profileImage?: string;
  CV?: string;
  fcmToken?: string;
  fcmTokens?: string[];
  phoneNumber?: string;
  password?: string;
  ConfirmPassword?: string;
  status: 'Active' | 'Blocked' | 'Delete';
  Designation: string;
  address?: string;
  postCode?: string;
  country?: string;
  role: Role;
  isHumanTrue: boolean;
  isDeleted: boolean;
  isBlocked: boolean;
  isEmailVerified: boolean;
  isResetPassword: boolean;
  isSubscription: boolean;
  oneTimeCode?: string | null;
  oneTimeCodeExpire?: Date | null;
  subEndDate?: Date | null;
  otpCountDown?: number | null;
  serviceCount?: number;
  Applied: boolean;
  Shortlisted: boolean;
  Rejected: boolean;
  Interview: boolean;
  Offer: boolean;
  createdAt: Date;
  updatedAt: Date;
  authType: 'local' | 'google' | 'facebook' | 'apple';
  socialId?: string;
  notificationPreferences?: {
    applied: boolean;
    shortlisted: boolean;
    interview: boolean;
    offer: boolean;
    info: boolean;
    system: boolean;
  };
};

export interface UserModal extends Model<TUser> {
  paginate: (
    filter: object,
    options: PaginateOptions
  ) => Promise<PaginateResult<TUser>>;
  isExistUserById(id: string): Promise<Partial<TUser> | null>;
  isExistUserByEmail(email: string): Promise<Partial<TUser> | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
}