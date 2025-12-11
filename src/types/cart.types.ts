/**
 * Cart Types - Baseado em Flutter cart_model.dart
 */

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  description: string;
  image: string;
  price: number;
  discountedPrice: number;
  variation: string[];
  variationType: string;
  quantity: number;
  tax: number;
  taxAmount: number;
  discount: number;
  discountType: 'flat' | 'percent';
  stock: number;
}

export interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  couponCode: string | null;
  couponDiscount: number;
  isLoading: boolean;
}

export interface AddToCartPayload {
  product: {
    id: number;
    name: string;
    description: string;
    image: string[];
    price: number;
    discount: number;
    discountType: 'flat' | 'percent';
    tax: number;
    taxType: 'included' | 'excluded';
    variations: Array<{
      type: string;
      price: number;
      stock: number;
    }>;
  };
  quantity: number;
  variation: string[];
  variationType: string;
}

export interface UpdateCartQuantityPayload {
  cartItemId: number;
  quantity: number;
}
