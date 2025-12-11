/**
 * Order Types - Baseado em Flutter order_model.dart
 */

export interface Order {
  id: number;
  userId: number;
  orderAmount: number;
  couponDiscountAmount: number;
  couponDiscountTitle: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  totalTaxAmount: number;
  paymentMethod: string;
  transactionReference: string;
  deliveryAddressId: number;
  createdAt: string;
  updatedAt: string;
  checked: number;
  deliveryManId: number;
  deliveryCharge: number;
  orderNote: string;
  couponCode: string;
  orderType: 'delivery' | 'self_pickup';
  branchId: number;
  timeSlotId: number;
  date: string;
  deliveryDate: string;
  extraDiscount: number;
  deliveryAddress: DeliveryAddress;
  customer: OrderCustomer;
  deliveryMan: DeliveryMan | null;
  orderPartialPayments: OrderPartialPayment[];
  offlinePaymentInformation: OfflinePaymentInfo | null;
}

export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'
  | 'failed'
  | 'canceled';

export interface DeliveryAddress {
  id: number;
  addressType: string;
  contactPersonNumber: string;
  address: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  contactPersonName: string;
  floor: string;
  house: string;
  road: string;
}

export interface OrderCustomer {
  id: number;
  fName: string;
  lName: string;
  email: string;
  phone: string;
  image: string;
}

export interface DeliveryMan {
  id: number;
  fName: string;
  lName: string;
  phone: string;
  email: string;
  image: string;
  rating: number;
}

export interface OrderPartialPayment {
  id: number;
  orderId: number;
  paidWith: string;
  paidAmount: number;
  dueAmount: number;
}

export interface OfflinePaymentInfo {
  id: number;
  orderId: number;
  paymentName: string;
  methodFields: Array<{
    key: string;
    value: string;
  }>;
  paymentNote: string;
}

export interface OrderDetails {
  id: number;
  productId: number;
  orderId: number;
  price: number;
  productDetails: string;
  variation: string;
  discountOnProduct: number;
  discountType: string;
  quantity: number;
  taxAmount: number;
  createdAt: string;
  updatedAt: string;
  variantInfo: string;
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  date: string;
  status: number;
}

export interface PlaceOrderRequest {
  cart: PlaceOrderCartItem[];
  couponDiscountAmount: number;
  couponDiscountTitle: string;
  orderAmount: number;
  orderType: 'delivery' | 'self_pickup';
  branchId: number;
  deliveryAddressId?: number;
  timeSlotId?: number;
  deliveryDate?: string;
  paymentMethod: string;
  orderNote?: string;
  couponCode?: string;
  distance?: number;
  transactionReference?: string;
  paymentInfo?: {
    method?: string;
    status?: string;
    paymentNote?: string;
  };
}

export interface PlaceOrderCartItem {
  productId: number;
  price: number;
  discountAmount: number;
  quantity: number;
  taxAmount: number;
  variant: string;
}

export interface OrdersState {
  orders: Order[];
  runningOrders: Order[];
  historyOrders: Order[];
  selectedOrder: Order | null;
  orderDetails: OrderDetails[];
  timeSlots: TimeSlot[];
  trackingData: TrackingData | null;
  totalSize: number;
  offset: number;
  isLoading: boolean;
  error: string | null;
}

export interface TrackingData {
  orderId: number;
  orderStatus: OrderStatus;
  deliveryManLocation: {
    latitude: string;
    longitude: string;
  } | null;
}
