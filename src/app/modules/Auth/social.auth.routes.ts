// routes/social.auth.routes.ts
import express from 'express';
import passport from './auth.passport.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import sendResponse from '../user/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import { Request, Response } from 'express';

const router = express.Router();

// Social authentication routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

// Google callback route
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/v1/auth/failure',
    session: false 
  }),
  AuthController.socialLoginSuccess
);

// Facebook route
router.get('/facebook', passport.authenticate('facebook', { 
  scope: ['email'],
  session: false 
}));

router.get('/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: '/api/v1/auth/failure',
    session: false 
  }),
  AuthController.socialLoginSuccess
);

router.post('/direct-login', async (req: Request, res: Response) => {
  try {
    console.log('📱 Direct login request:', {
      provider: req.body.provider,
      accessTokenLength: req.body.accessToken?.length
    });
    
    const { provider, accessToken } = req.body;
    
    if (!provider || !accessToken) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: 'Provider and access token are required',
        data: null,
        success: false
      });
    }
    
    let userProfile;
    if (provider === 'google') {
      userProfile = await verifyGoogleToken(accessToken);
      console.log('✅ Google token verified successfully');
    } else if (provider === 'facebook') {
      userProfile = await verifyFacebookToken(accessToken);
      console.log('✅ Facebook token verified successfully');
    } else {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: 'Unsupported provider',
        data: null,
        success: false
      });
    }

    console.log('🔐 User profile verified:', {
      id: userProfile.id,
      email: userProfile.email,
      name: `${userProfile.firstName || userProfile.given_name} ${userProfile.lastName || userProfile.family_name}`.trim()
    });
    
    if (!userProfile.email) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: 'Email is required but not provided by the social provider',
        data: null,
        success: false
      });
    }
    
    // Find or create user
    let user = await User.findOne({
      $or: [
        { email: userProfile.email },
        { socialId: userProfile.id, authType: provider }
      ]
    });

    console.log('👤 User found in database:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('🆕 Creating new user...');
      user = await User.create({
        firstName: userProfile.firstName || userProfile.given_name || extractFirstName(userProfile.name) || 'User',
        lastName: userProfile.lastName || userProfile.family_name || extractLastName(userProfile.name) || '',
        email: userProfile.email,
        socialId: userProfile.id,
        authType: provider,
        profileImage: userProfile.picture,
        Designation: 'Social User',
        password: 'social-auth-no-password',
        ConfirmPassword: 'social-auth-no-password',
        isEmailVerified: userProfile.email_verified || true,
      });
      console.log('✅ New user created successfully:', user.email);
    } else {
      console.log('📝 Updating existing user...');
      // Update existing user
      user.socialId = userProfile.id;
      user.authType = provider;
      user.profileImage = userProfile.picture;
      user.isEmailVerified = userProfile.email_verified || true;
      
      // Update name if not already set or if we have better data
      if ((!user.firstName || user.firstName === 'User') && (userProfile.firstName || userProfile.given_name)) {
        user.firstName = userProfile.firstName || userProfile.given_name;
      }
      if ((!user.lastName || user.lastName === '') && (userProfile.lastName || userProfile.family_name)) {
        user.lastName = userProfile.lastName || userProfile.family_name;
      }
      
      await user.save();
      console.log('✅ User updated successfully:', user.email);
    }
    
    const result = await AuthService.socialLogin(user);
    console.log('🎉 Social login successful for:', user.email);
    
    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Social login successful',
      data: result,
      success: true
    });
  } catch (error) {
    console.error('❌ Direct login error:', error);
    sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'Social authentication failed: ' + (error as Error).message,
      data: null,
      success: false
    });
  }
});

// Helper function to extract first name from full name
function extractFirstName(fullName: string): string {
  if (!fullName) return 'User';
  return fullName.split(' ')[0] || 'User';
}

// Helper function to extract last name from full name  
function extractLastName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.split(' ');
  return parts.length > 1 ? parts.slice(1).join(' ') : '';
}

// Unified Google token verification function
async function verifyGoogleToken(token: string): Promise<any> {
  try {
    console.log('🔐 Verifying Google token...');
    
    // First, try to verify as ID token
    try {
      const userProfile = await verifyGoogleIdToken(token);
      console.log('✅ Token verified as Google ID token');
      return userProfile;
    } catch (idTokenError) {
      console.log('🔄 Not an ID token, trying as access token...');
      // If ID token verification fails, try as access token
      const userProfile = await verifyGoogleAccessToken(token);
      console.log('✅ Token verified as Google access token');
      return userProfile;
    }
  } catch (error) {
    console.error('❌ Google token verification failed:', error);
    throw new Error(`Google authentication failed: ${(error as Error).message}`);
  }
}

// Verify Google ID Token (JWT)
async function verifyGoogleIdToken(idToken: string): Promise<any> {
  try {
    const { OAuth2Client } = require('google-auth-library');
    
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID environment variable is not set');
    }
    
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('No payload received from Google token verification');
    }
    
    console.log('📄 Google ID token payload:', {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name
    });
    
    return {
      id: payload.sub,
      email: payload.email,
      given_name: payload.given_name,
      family_name: payload.family_name,
      firstName: payload.given_name,
      lastName: payload.family_name,
      picture: payload.picture,
      name: payload.name,
      email_verified: payload.email_verified,
    };
  } catch (error) {
    console.error('❌ Google ID token verification error:', error);
    throw new Error(`Invalid Google ID token: ${(error as Error).message}`);
  }
}

// Verify Google Access Token (OAuth)
async function verifyGoogleAccessToken(accessToken: string): Promise<any> {
  try {
    const axios = require('axios');
    
    // Use OAuth2 API to get user info
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        timeout: 10000
      }
    );

    const userInfo = response.data;
    console.log('📄 Google OAuth2 API response:', {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name
    });

    if (!userInfo.sub && !userInfo.email) {
      throw new Error('Invalid user info response from Google');
    }

    return {
      id: userInfo.sub || userInfo.id,
      email: userInfo.email,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      picture: userInfo.picture,
      name: userInfo.name,
      email_verified: userInfo.email_verified || true,
    };
  } catch (error: any) {
    console.error('❌ Google OAuth2 API error:', error.response?.data || error.message);
    throw new Error(`Google access token verification failed: ${error.response?.data?.error || error.message}`);
  }
}

// Facebook token verification function
async function verifyFacebookToken(accessToken: string): Promise<any> {
  try {
    console.log('🔐 Verifying Facebook token...');
    const axios = require('axios');
    
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email,first_name,last_name,picture&access_token=${accessToken}`,
      {
        timeout: 10000
      }
    );
    
    const profile = response.data;
    
    if (!profile.id) {
      throw new Error('Invalid Facebook token response');
    }
    
    console.log('📄 Facebook profile:', {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      first_name: profile.first_name,
      last_name: profile.last_name
    });
    
    return {
      id: profile.id,
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      firstName: profile.first_name,
      lastName: profile.last_name,
      picture: profile.picture?.data?.url,
      name: profile.name,
    };
  } catch (error: any) {
    console.error('❌ Facebook token verification error:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      if (fbError.code === 190) {
        throw new Error('Facebook token has expired or is invalid');
      }
      throw new Error(`Facebook API error: ${fbError.message}`);
    }
    
    throw new Error(`Invalid Facebook token: ${error.message}`);
  }
}

// Social auth failure route
router.get('/failure', AuthController.socialLoginFailure);

export const SocialAuthRoutes = router;