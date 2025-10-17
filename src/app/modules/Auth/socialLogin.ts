export interface ISocialLoginUser {
  email: string;
  firstName: string;
  lastName: string;
  socialId: string;
  profileImage?: string;
  authType: 'google' | 'facebook' | 'apple';
}

export interface ISocialLoginResponse {
  user: any;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}