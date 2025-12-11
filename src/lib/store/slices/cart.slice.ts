/**
 * Cart Slice - Baseado em Flutter CartProvider
 * Carrinho é mantido localmente (localStorage)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, CartState, AddToCartPayload } from '@/types/cart.types';
import { STORAGE_KEYS } from '@/lib/api/client';

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  subTotal: 0,
  taxAmount: 0,
  discountAmount: 0,
  couponCode: null,
  couponDiscount: 0,
  isLoading: false,
};

// Helpers
const calculateCartTotals = (items: CartItem[]) => {
  const subTotal = items.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0
  );
  const taxAmount = items.reduce((sum, item) => sum + item.taxAmount * item.quantity, 0);
  const discountAmount = items.reduce(
    (sum, item) => sum + (item.price - item.discountedPrice) * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = subTotal + taxAmount;

  return { subTotal, taxAmount, discountAmount, totalItems, totalAmount };
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.CART_LIST, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }
};

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART_LIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initializeCart: (state) => {
      const items = loadCartFromStorage();
      state.items = items;
      const totals = calculateCartTotals(items);
      Object.assign(state, totals);
    },

    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { product, quantity, variation, variationType } = action.payload;

      // Calcular preço com desconto
      let price = product.price;
      let discountedPrice = price;

      // Verificar variação
      if (variation.length > 0 && product.variations) {
        const selectedVariation = product.variations.find(
          (v) => v.type === variationType
        );
        if (selectedVariation) {
          price = selectedVariation.price;
        }
      }

      // Aplicar desconto
      if (product.discount > 0) {
        if (product.discountType === 'percent') {
          discountedPrice = price - (price * product.discount) / 100;
        } else {
          discountedPrice = price - product.discount;
        }
      } else {
        discountedPrice = price;
      }

      // Calcular taxa
      let taxAmount = 0;
      if (product.tax > 0) {
        if (product.taxType === 'excluded') {
          taxAmount = (discountedPrice * product.tax) / 100;
        }
      }

      // Verificar se item já existe no carrinho
      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === product.id &&
          JSON.stringify(item.variation) === JSON.stringify(variation)
      );

      if (existingIndex >= 0) {
        // Atualizar quantidade
        state.items[existingIndex].quantity += quantity;
      } else {
        // Adicionar novo item
        const newItem: CartItem = {
          id: Date.now(),
          productId: product.id,
          name: product.name,
          description: product.description,
          image: product.image[0] || '',
          price,
          discountedPrice,
          variation,
          variationType,
          quantity,
          tax: product.tax,
          taxAmount,
          discount: product.discount,
          discountType: product.discountType,
          stock: 100, // TODO: Pegar do produto
        };
        state.items.push(newItem);
      }

      // Recalcular totais
      const totals = calculateCartTotals(state.items);
      Object.assign(state, totals);

      // Salvar no storage
      saveCartToStorage(state.items);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      const totals = calculateCartTotals(state.items);
      Object.assign(state, totals);
      saveCartToStorage(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ cartItemId: number; quantity: number }>
    ) => {
      const { cartItemId, quantity } = action.payload;
      const index = state.items.findIndex((item) => item.id === cartItemId);

      if (index >= 0) {
        if (quantity <= 0) {
          state.items.splice(index, 1);
        } else {
          state.items[index].quantity = quantity;
        }

        const totals = calculateCartTotals(state.items);
        Object.assign(state, totals);
        saveCartToStorage(state.items);
      }
    },

    incrementQuantity: (state, action: PayloadAction<number>) => {
      const index = state.items.findIndex((item) => item.id === action.payload);
      if (index >= 0) {
        state.items[index].quantity += 1;
        const totals = calculateCartTotals(state.items);
        Object.assign(state, totals);
        saveCartToStorage(state.items);
      }
    },

    decrementQuantity: (state, action: PayloadAction<number>) => {
      const index = state.items.findIndex((item) => item.id === action.payload);
      if (index >= 0) {
        if (state.items[index].quantity > 1) {
          state.items[index].quantity -= 1;
        } else {
          state.items.splice(index, 1);
        }
        const totals = calculateCartTotals(state.items);
        Object.assign(state, totals);
        saveCartToStorage(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalItems = 0;
      state.subTotal = 0;
      state.taxAmount = 0;
      state.discountAmount = 0;
      state.couponCode = null;
      state.couponDiscount = 0;
      saveCartToStorage([]);
    },

    applyCoupon: (
      state,
      action: PayloadAction<{ code: string; discount: number }>
    ) => {
      state.couponCode = action.payload.code;
      state.couponDiscount = action.payload.discount;
      state.totalAmount = state.subTotal + state.taxAmount - action.payload.discount;
    },

    removeCoupon: (state) => {
      state.couponCode = null;
      state.couponDiscount = 0;
      state.totalAmount = state.subTotal + state.taxAmount;
    },
  },
});

export const {
  initializeCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;
