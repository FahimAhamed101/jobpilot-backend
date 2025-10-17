import bcrypt from 'bcrypt';
import { Schema, model, Document } from 'mongoose';
import config from '../../../config';
import { TUser, UserModal } from './user.interface';
import paginate from '../../../helpers/paginate';

const userSchema = new Schema<TUser, UserModal>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    CV: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    postCode: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    userId: {
      type: String,
    },
    password: {
      type: String,
      required: function (this: TUser) {
        return this.authType === 'local';
      },
      select: false,
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    ConfirmPassword: {
      type: String,
      required: function (this: TUser) {
        return this.authType === 'local';
      },
      select: false,
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    Designation: {
      type: String,
      required: [true, "Designation Is Required"]
    },
    role: {
      type: String,
      enum: ["admin", "superAdmin", "analyst", "user", "recruiter"],
      default: "user"
    },
    authType: {
      type: String,
      enum: ['local', 'google', 'facebook', 'apple'],
      default: 'local'
    },
    socialId: {
      type: String,
      sparse: true
    },
    isHumanTrue: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: [true, 'Deleted status is required'],
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    isBlocked: {
      type: Boolean,
      default: false,
      required: [true, 'Blocked status is required'],
    },
    isSubscription: {
      type: Boolean,
      default: false
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      required: [true, 'Email verification status is required'],
    },
    isResetPassword: {
      type: Boolean,
      default: false,
      required: [true, 'Reset password status is required'],
    },
    oneTimeCode: {
      type: String,
      default: null,
    },
    oneTimeCodeExpire: {
      type: Date,
      default: null,
    },
    subEndDate: {
      type: Date,
      default: null,
    },
    serviceCount: {
      type: Number,
      default: 0
    },
    otpCountDown: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Blocked', 'Delete'],
      default: 'Active',
    },
    fcmToken: {
      type: String,
      default: null,
    },
    fcmTokens: [{
      type: String,
    }],
    notificationPreferences: {
      applied: { type: Boolean, default: true },
      shortlisted: { type: Boolean, default: true },
      interview: { type: Boolean, default: true },
      offer: { type: Boolean, default: true },
      info: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
    },
    Applied: {
      type: Boolean,
      default: true
    },
    Shortlisted: {
      type: Boolean,
      default: true
    },
    Rejected: {
      type: Boolean,
      default: true
    },
    Interview: {
      type: Boolean,
      default: true
    },
    Offer: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('fullName').get(function (this: TUser) {
  return `${this.firstName} ${this.lastName || ''}`.trim();
});

userSchema.plugin(paginate);

// Static methods
userSchema.statics.isExistUserById = async function (id: string): Promise<Partial<TUser> | null> {
  return await this.findById(id).select('-password -ConfirmPassword');
};

userSchema.statics.isExistUserByEmail = async function (email: string): Promise<Partial<TUser> | null> {
  return await this.findOne({ email }).select('-password -ConfirmPassword');
};

userSchema.statics.isMatchPassword = async function (
  password: string,
  hashPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashPassword);
};

// Middleware to hash password before saving (only for local auth)
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.authType === 'local' && this.password) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt.saltRounds)
    );
  }

  // Also hash ConfirmPassword if it's modified and exists
  if (this.isModified('ConfirmPassword') && this.authType === 'local' && this.ConfirmPassword) {
    this.ConfirmPassword = await bcrypt.hash(
      this.ConfirmPassword,
      Number(config.bcrypt.saltRounds)
    );
  }
  next();
});

export const User = model<TUser, UserModal>('User', userSchema);