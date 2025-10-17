import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from './user.model';
import { TUser } from './user.interface';
import { sendEmailInvitation, sendEmailVerification } from '../../../helpers/emailHelper';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import createOtp from '../Auth/createOtp';
import mongoose from 'mongoose';

//create new user
const createUserToDB = async (payload: Partial<TUser>) => {
  const { oneTimeCode, oneTimeCodeExpire } = createOtp();
  payload.otpCountDown = 180;
  payload.oneTimeCode = oneTimeCode;
  payload.oneTimeCodeExpire = oneTimeCodeExpire;

  console.log("payload==============>>>>>>>>>>>" ,payload)

  const newUser = await User.create(payload);
  if (!newUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }
  if (!newUser.isEmailVerified) {
    // Send email verification
    await sendEmailVerification(newUser.email as string, oneTimeCode);
  }

  return newUser;
};
const createAdminAnalystUserToDB = async (payload: Partial<TUser>) => {
  payload.otpCountDown = 180;

  console.log("payload==============>>>>>>>>>>>" ,payload)

  const newUser = await User.create(payload);
  if (!newUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }
  if (!newUser.isEmailVerified) {
    // Send email verification
    await sendEmailInvitation(newUser.email as string, payload.password as string, 
      newUser.role as string);
  }

  return newUser;
};


//get all user
const getAllUsersFromDB = async (pageNumber : number, limitNumber : number) => {
  const users = await User.find({ role: 'user' })
  .sort({ createdAt: -1 })
  .skip((pageNumber - 1) * limitNumber) // Skip (page - 1) * limit records
  .limit(limitNumber); // Limit to the specified number of records;
  return users;
};

const getAllUsersByRoleFromDB = async (pageNumber : number, limitNumber : number, role : string) => {
  const users = await User.find({ role: role })
  .sort({ createdAt: -1 })
  .skip((pageNumber - 1) * limitNumber) // Skip (page - 1) * limit records
  .limit(limitNumber); // Limit to the specified number of records;
  return users;
};

//get single user
const getSingleUserFromDB = async (id: string): Promise<Partial<TUser>> => {
  const user = await User.isExistUserById(id);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return user;
};

//update my profile
const updateMyProfile = async (
  id: string,
  payload: Partial<TUser>
): Promise<TUser | null> => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return User.findByIdAndUpdate(id, payload, { new: true });
};

//fill up user details data
const fillUpUserDetails = async (userId: string, payload: Partial<TUser>) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return User.findByIdAndUpdate(userId, payload, { new: true });
};

const updateUserImage = async (userId: string, payload: Partial<TUser>) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return User.findByIdAndUpdate(userId, payload, { new: true });
};
//get my profile
const getMyProfile = async (userId: string): Promise<Partial<TUser>> => {
  const isExistUser = await User.isExistUserById(userId);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};
// In your UserService - complete hard delete
const deleteUserById = async (userId: string): Promise<any> => {
  try {
    console.log('Attempting to COMPLETELY DELETE user with ID:', userId);
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user ID format');
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    // Prevent deleting super admin
    if (user.role === 'superAdmin') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot delete super admin user');
    }

    // Perform COMPLETE deletion (hard delete)
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete user');
    }
    
    // Return meaningful result
    return {
      _id: deletedUser._id,
      email: user.email,
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      role: user.role,
      deletedAt: new Date(),
      message: 'User permanently deleted from database'
    };
  } catch (error) {
    console.error('Error in deleteUserById service:', error);
    
    // If it's already an ApiError, re-throw it
    if (error instanceof ApiError) {
      throw error;
    }
    
    // For other errors, throw a proper ApiError
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR, 
      `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
const changeUserStatus = async (
  id: string,
  action: 'block' | 'unblock' | 'delete' | 'active'
): Promise<TUser | null> => {
  // Validate if the user exists
  const user = await User.isExistUserById(id);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Prepare the update payload
  let updatePayload = {};
  switch (action) {
    case 'block':
      updatePayload = { isBlocked: true, status: 'Blocked' };
      break;
    case 'unblock':
      updatePayload = { isBlocked: false, status: 'Active' };
      break;
    case 'delete':
      updatePayload = { isDeleted: true, status: 'Delete' };
      break;
    case 'active':
      updatePayload = { isDeleted: false, isBlocked: false, status: 'Active' };
      break;
    default:
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid action!');
  }

  // Update and return the user
  return User.findByIdAndUpdate(id, updatePayload, { new: true });
};

//delete my profile
const deleteMyProfile = async (id: string): Promise<TUser | null> => {
  await getSingleUserFromDB(id);
  return User.findByIdAndUpdate(
    id,
    { status: 'Delete', isDeleted: true },
    { new: true }
  );
};

//Update user email verification and send OTP.
const isUpdateUser = async (email: string): Promise<TUser | null> => {
  const { oneTimeCode, oneTimeCodeExpire } = createOtp();

  const updatedUser = await User.findOneAndUpdate(
    { email },
    {
      isEmailVerified: false,
      isResetPassword: false,
      oneTimeCode,
      oneTimeCodeExpire,
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found for update!');
  }

  // Send email verification
  await sendEmailVerification(updatedUser.email, oneTimeCode);

  return updatedUser;
};

const getSingleUserById = async (id :string) => {
  const result = await User.findById(id);
  return result
}

const searchByUidFromDB = async (Uid : string) => {
  const result = await User.find({userId : Uid});
  return result;
}

// Add this to your existing user.service.ts

//delete user with password confirmation
const deleteUserWithPassword = async (
  userId: string, 
  password: string
): Promise<TUser | null> => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User doesn't exist!");
  }

  // Check if user has local auth (has password)
  if (user.authType === 'local') {
    if (!password) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is required to delete account');
    }

    // Verify password
    const isPasswordMatch = await User.isMatchPassword(password, user.password);
    if (!isPasswordMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid password');
    }
  }

  // Soft delete the user
  return User.findByIdAndUpdate(
    userId,
    { 
      status: 'Delete', 
      isDeleted: true,
      email: `deleted_${Date.now()}@deleted.com`, // Optional: anonymize email
      phoneNumber: null, // Optional: remove personal data
      fcmToken: null // Optional: remove device tokens
    },
    { new: true }
  );
};
const updateUserById = async (userId: string, payload: Partial<TUser>): Promise<TUser> => {
  console.log('=== UPDATE USER BY ID SERVICE ===');
  console.log('User ID:', userId);
  console.log('Update payload:', payload);

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  // Check if email is being updated and if it's already taken
  if (payload.email && payload.email !== user.email) {
    const existingUserWithEmail = await User.findOne({ 
      email: payload.email,
      _id: { $ne: userId } // Exclude current user
    });
    
    if (existingUserWithEmail) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists');
    }
  }

  // Prepare update data
  const updateData: Partial<TUser> = { ...payload };

  // Remove any undefined or null values
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof TUser] === undefined || updateData[key as keyof TUser] === null) {
      delete updateData[key as keyof TUser];
    }
  });

  console.log('Final update data:', updateData);

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { 
      new: true, // Return updated document
      runValidators: true // Run schema validators
    }
  ).select('-password -ConfirmPassword'); // Exclude passwords

  if (!updatedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found after update');
  }

  console.log('User updated successfully:', updatedUser.email);
  return updatedUser;
};

export const UserService = {
  createUserToDB,
  getAllUsersFromDB,
  getAllUsersByRoleFromDB,
  getSingleUserFromDB,
  getMyProfile,
  updateMyProfile, deleteUserWithPassword, 
  updateUserImage,
  fillUpUserDetails,
  deleteMyProfile,
  isUpdateUser,updateUserById,
  changeUserStatus,deleteUserById, 
  createAdminAnalystUserToDB,
  searchByUidFromDB
};
