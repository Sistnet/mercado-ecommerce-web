/**
 * Payment Types - Baseado em Flutter payment models
 */

import type { PaymentMethod } from './config.types';
import type { OfflinePaymentInfo } from './order.types';

export interface OfflinePaymentMethod {
  id: number;
  methodName: string;
  methodFields: MethodField[];
  paymentNote: string;
  status: boolean;
}

export interface MethodField {
  fieldName: string;
  fieldData: string;
  isRequired: boolean;
}

export interface Coupon {
  id: number;
  title: string;
  code: string;
  startDate: string;
  expireDate: string;
  minPurchase: number;
  maxDiscount: number;
  discount: number;
  discountType: 'flat' | 'percent';
  couponType: 'default' | 'first_order' | 'customer_wise';
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponApplyResponse {
  discount: number;
  discountType: 'flat' | 'percent';
  couponCode: string;
  maxDiscount: number;
}

export interface CouponState {
  coupons: Coupon[];
  appliedCoupon: CouponApplyResponse | null;
  isLoading: boolean;
  error: string | null;
}

export interface CheckoutData {
  cartItems: Array<{
    productId: number;
    price: number;
    discountAmount: number;
    quantity: number;
    taxAmount: number;
    variant: string;
  }>;
  orderType: 'delivery' | 'self_pickup';
  branchId: number;
  deliveryAddressId?: number;
  timeSlotId?: number;
  deliveryDate?: string;
  paymentMethod: string;
  orderNote?: string;
  couponCode?: string;
  couponDiscount?: number;
  orderAmount: number;
  deliveryCharge: number;
  distance?: number;
}

export interface CheckoutState {
  checkoutData: CheckoutData | null;
  selectedPaymentMethod: PaymentMethod | null;
  offlinePaymentInfo: OfflinePaymentInfo | null;
  isPlacingOrder: boolean;
  orderPlaced: boolean;
  orderId: number | null;
  error: string | null;
}
