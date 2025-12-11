/**
 * User Types - Baseado em Flutter user_info_model.dart
 */

export interface UserProfile {
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
  walletBalance: number;
  loyaltyPoint: number;
  referCode?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
}

export interface UpdateProfileRequest {
  fName: string;
  lName: string;
  email: string;
  phone: string;
  password?: string;
  image?: File;
}

export interface ProfileState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface WalletTransaction {
  id: number;
  userId: number;
  transactionId: string;
  credit: number;
  debit: number;
  balance: number;
  transactionType: WalletTransactionType;
  reference: string;
  createdAt: string;
  updatedAt: string;
  adminBonus: number;
}

export type WalletTransactionType =
  | 'order_place'
  | 'loyalty_point_to_wallet'
  | 'add_fund'
  | 'referral_order_place'
  | 'add_fund_bonus'
  | 'add_fund_by_admin';

export interface LoyaltyTransaction {
  id: number;
  userId: number;
  transactionId: string;
  loyaltyPointStatus: string;
  credit: number;
  debit: number;
  balance: number;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
  loyaltyPoints: number;
  loyaltyTransactions: LoyaltyTransaction[];
  bonuses: WalletBonus[];
  totalSize: number;
  offset: number;
  isLoading: boolean;
  error: string | null;
  filterType: string;
}

export interface WalletBonus {
  id: number;
  title: string;
  description: string;
  bonusType: 'percentage' | 'amount';
  bonusAmount: number;
  minimumAddAmount: number;
  maximumBonusAmount: number;
  startDate: string;
  endDate: string;
  status: number;
}

export interface WishlistItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    image: string[];
    price: number;
    discount: number;
    discountType: 'flat' | 'percent';
    rating: Array<{ average: number }>;
  };
}

export interface WishlistState {
  items: WishlistItem[];
  productIds: number[];
  isLoading: boolean;
  error: string | null;
}
