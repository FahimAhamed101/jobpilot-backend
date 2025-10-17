export interface ILogin {
  email: string;
  password: string;
}

export interface IVerifyEmail {
  email: string;
  oneTimeCode: number;
  
}
export interface IResetPassword {
  email: string;
  newPassword: string;
  ConfirmPassword: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}
export interface IUserPayload {
  id: string;       // Assuming the `id` is a string representing the user ID
  email: string;    // The user's email
  role: string;     // The user's role (e.g., 'user', 'admin', etc.)
  iat: number;      // The issued-at timestamp (JWT field)
  exp: number;      // The expiration timestamp (JWT field)
}

