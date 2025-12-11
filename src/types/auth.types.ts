/**
 * Auth Types - Baseado em Flutter auth models
 */

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
  guestId?: string;
}

export interface LoginResponse {
  token: string;
  temporaryToken?: string;
  user?: UserInfo;
}

export interface RegisterRequest {
  fName: string;
  lName: string;
  phone: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface SocialLoginRequest {
  email: string;
  token: string;
  uniqueId: string;
  medium: 'google' | 'facebook' | 'apple';
}

export interface VerifyOtpRequest {
  phone?: string;
  email?: string;
  token: string;
}

export interface ResetPasswordRequest {
  phone?: string;
  email?: string;
  password: string;
  confirmPassword: string;
  resetToken: string;
}

export interface UserInfo {
  id: number;
  fName: string;
  lName: string;
  email: string;
  phone: string;
  image?: string;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  cmFirebaseToken?: string;
  createdAt: string;
  updatedAt: string;
  walletBalance?: number;
  loyaltyPoint?: number;
  referCode?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  token: string | null;
  temporaryToken: string | null;
  error: string | null;
  guestId: string | null;
}
