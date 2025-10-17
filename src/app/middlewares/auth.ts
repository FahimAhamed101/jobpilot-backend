import { USER_ROLE } from './../modules/user/user.constant';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../shared/catchAsync';
import AppError from '../../errors/AppError';
import config from '../../config';
import { User } from '../modules/user/user.model';

// Use the actual User type from your model
// Assuming your User model has these properties
interface AuthUser extends JwtPayload {
  id: string;
  role: keyof typeof USER_ROLE;
  iat?: number;
  exp?: number;
}

// Extend the Express Request interface with the full User type
declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>; // This refers to your Mongoose User model
    }
  }
}

const auth = (...requiredRoles: (keyof typeof USER_ROLE)[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const rawToken = req.headers.authorization;
    const token = rawToken?.split(' ')[1];

    // Check if the token is missing
    if (!token) {
      console.log("Token missing");
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    // Verify if the given token is valid
    let decoded: AuthUser;
    try {
      decoded = jwt.verify(
        token,
        config.jwt.accessSecret as string,
      ) as AuthUser;
    } catch (error) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token!');
    }

    const { role, id } = decoded;
    console.log("User Id", id);
    
    // Check if token has required properties
    if (!id || !role) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token payload!');
    }

    // Find the full user document
    const user = await User.findById(id);

    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    // Check if the role is not allowed
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      res.status(401).send({
        "success": false,
        "statusCode": 401,
        "message": "You have no access to this route",
      });
      return;
    }

    // Attach the FULL user document to the request object
    req.user = user;
    next();
  });
};

export default auth;