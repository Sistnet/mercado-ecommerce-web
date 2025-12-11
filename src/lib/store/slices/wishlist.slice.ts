/**
 * Wishlist Slice - Baseado em Flutter WishListProvider
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { WishlistState, WishlistItem } from '@/types/user.types';

const initialState: WishlistState = {
  items: [],
  productIds: [],
  isLoading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ products: WishlistItem[] }>(API_ENDPOINTS.WISHLIST);
      return response.data.products;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId: number, { rejectWithValue }) => {
    try {
      await api.post(API_ENDPOINTS.WISHLIST, { product_id: productId });
      return productId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: number, { rejectWithValue }) => {
    try {
      await api.delete(`${API_ENDPOINTS.WISHLIST}?product_id=${productId}`);
      return productId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to remove from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearWishlist: (state) => { state.items = []; state.productIds = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.isLoading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.productIds = action.payload.map(item => item.productId);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.productIds.push(action.payload);
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.productId !== action.payload);
        state.productIds = state.productIds.filter(id => id !== action.payload);
      });
  },
});

export const { clearError, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
