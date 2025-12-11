/**
 * Coupon Slice - Baseado em Flutter CouponProvider
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Coupon, CouponState, CouponApplyResponse } from '@/types/payment.types';

const initialState: CouponState = {
  coupons: [],
  appliedCoupon: null,
  isLoading: false,
  error: null,
};

export const fetchCoupons = createAsyncThunk(
  'coupon/fetchCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Coupon[]>(API_ENDPOINTS.COUPON_LIST);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch coupons');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'coupon/applyCoupon',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await api.get<CouponApplyResponse>(`${API_ENDPOINTS.COUPON_APPLY}?code=${code}`);
      return { ...response.data, couponCode: code };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Invalid coupon code');
    }
  }
);

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    removeCoupon: (state) => { state.appliedCoupon = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(applyCoupon.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appliedCoupon = action.payload;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, removeCoupon } = couponSlice.actions;
export default couponSlice.reducer;
